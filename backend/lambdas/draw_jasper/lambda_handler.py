import base64
from concurrent import futures
import cv2
import datetime
import json
import math
import uuid
import os
import tempfile

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import BadRequestException, UnauthorizedException
from .run_comparison import (
    crop_to_content, resize_with_aspect_ratio, convert_to_black_and_white,
    fill_outline,
)

BUCKET_NAME = "aseaman-public-bucket"
JASPER_PREFIX = "aseaman/images/jasper"
TABLE_NAME = 'whisky'
LOCAL_TABLE_NAME = 'whisky_local'

MAX_WORKERS = 10
RESPONSE_COUNT = 3

class DrawJasperLambdaHandler(APILambdaHandlerBase):
    require_auth = True

    def _init(self):
        self.id = uuid.uuid4().hex
        self.table_name = LOCAL_TABLE_NAME if self.is_local else TABLE_NAME
        self.date = datetime.datetime.now()
        self.s3_key_prefix = 'aseaman/images/jasper/jobs/{date}/{id}'.format(
            date=datetime.datetime.now().date(),
            id=self.id,
        )
        self.s3_key_format = self.s3_key_prefix + '/{}'

    def _init_aws(self):
        self.ddb_client = self.aws_session.client('dynamodb', region_name='us-east-1')
        self.s3_client = self.aws_session.client('s3', region_name='us-east-1')

    def _parse_payload(self, payload):
        # return
        if not payload.get('img'):
            raise BadRequestException('img parameter required')
        self.imgBytes = base64.b64decode(payload['img'].split(',')[1])

    def _download(self, key):
        tmpdir = tempfile.gettempdir()
        filename = key.split('/')[-1]
        local_filename = os.path.join(tmpdir, filename)
        with open(local_filename, 'wb') as data:
            self.s3_client.download_fileobj(BUCKET_NAME, key, data)
        return local_filename

    def _download_all_masks(self):
        mask_response = self.s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            MaxKeys=50,
            Prefix='{}/data/masks/'.format(JASPER_PREFIX),
        )

        mask_keys = [file['Key'] for file in mask_response['Contents'] if file['Key'].endswith('.png')]

        with futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_key = {executor.submit(self._download, key): key.split('/')[-1].split('.')[0] for key in mask_keys}

            for future in futures.as_completed(future_to_key):
                key = future_to_key[future]
                exception = future.exception()
                if not exception:
                    yield key, future.result()
                else:
                    yield key, exception

    def _save_file_to_local_temp(self):
        filename = '{}.png'.format(self.id)
        tmpdir = tempfile.gettempdir()
        local_filename = os.path.join(tmpdir, filename)
        with open(local_filename, "wb") as fh:
            fh.write(self.imgBytes)

        return local_filename

    def _save_image_to_s3(self, img_bytes, filename):
        self.s3_client.put_object(
            Body=img_bytes,
            Bucket=BUCKET_NAME,
            Key=self.s3_key_format.format(filename),
        )

    def _save_cv2_image_to_s3(self, cv2_image, filename, ext=".png"):
        img_bytes = cv2.imencode(ext, cv2_image)[1].tobytes()
        self._save_image_to_s3(img_bytes, filename)

    def _run_comparison(self, drawing_file, mask_file):
        drawing = cv2.imread(drawing_file, cv2.IMREAD_GRAYSCALE)
        mask = cv2.imread(mask_file, cv2.IMREAD_GRAYSCALE)
        drawing_cropped = crop_to_content(drawing)
        mask_cropped = crop_to_content(mask, invert=False)

        self._save_cv2_image_to_s3(drawing_cropped, 'cropped_drawing.png')

        # Match their drawing size to ours
        # (this has to be before converting to black and white, I think there are interpolation issues)
        (drawing_height, drawing_width) = drawing_cropped.shape[:2]

        # Make ours the height of theirs, maintaining aspect ratio
        mask_sized = resize_with_aspect_ratio(mask_cropped, height=drawing_height)
        drawing_sized = drawing_cropped

        # Make their drawing black and white
        drawing_bw = convert_to_black_and_white(drawing_sized)
        drawing_sized = fill_outline(drawing_bw)

        (_, mask_width) = mask_sized.shape[:2]

        # Find the larger
        larger_width = max(drawing_width, mask_width)
        smaller_width = min(drawing_width, mask_width)
        padding_left = math.floor((larger_width - smaller_width) / 2)
        padding_right = math.ceil((larger_width - smaller_width) / 2)
        if larger_width == drawing_width:
            mask_padded = cv2.copyMakeBorder(mask_sized, 0, 0, padding_left, padding_right, cv2.BORDER_CONSTANT, value=[0,0,0])
            drawing_padded = drawing_sized
        else:
            drawing_padded = cv2.copyMakeBorder(drawing_sized, 0, 0, padding_left, padding_right, cv2.BORDER_CONSTANT, value=[0,0,0])
            mask_padded = mask_sized
        difference = cv2.subtract(mask_padded, drawing_padded)
        difference_2 = cv2.subtract(drawing_padded, mask_padded)
        both_differences = cv2.add(difference, difference_2)
        non_zero_count = cv2.countNonZero(both_differences)

        self._save_cv2_image_to_s3(both_differences, 'difference.png')

        return both_differences, non_zero_count


    def _run(self):
        self._save_image_to_s3(self.imgBytes, "input_drawing.png")
        user_drawing_filename = self._save_file_to_local_temp()
        results = []
        for (key, filepath) in self._download_all_masks():
            res, nzc = self._run_comparison(user_drawing_filename, filepath)
            results.append((nzc, key))

        result = {
            'results': sorted(results),
        }

        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "multiValueHeaders": {},
            "body": json.dumps(result)
        }


def lambda_handler(event, context):
    return DrawJasperLambdaHandler(event, context).handle()
