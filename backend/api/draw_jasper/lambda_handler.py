import base64
import datetime
from functools import partial
import json
import math
import os
import tempfile
import uuid
from concurrent import futures

import cv2

from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import AWSConfig, S3Config, S3BucketConfig
from base.s3 import S3Bucket


PUBLIC_BUCKET_NAME = "aseaman-public-bucket"
JASPER_PREFIX = "aseaman/images/jasper"

MAX_WORKERS = 10
RESPONSE_COUNT = 3

IMG_SHAPE = (400, 800)
IMG_MAX_SIZE = 15000


def resize_by_height(image, height):
    (h, w) = image.shape[:2]
    ratio = height / float(h)
    mult = (int(w * ratio), height)
    return cv2.resize(image, mult, interpolation=cv2.INTER_AREA)


def crop_to_content(img, invert=True):
    """
    Crops image to fit content
    """
    inverted_image = (
        cv2.bitwise_not(img) if invert else img
    )  # invert image -- black background (zeroes)
    coords = cv2.findNonZero(inverted_image)  # find coordinates of all non-zero values
    x, y, w, h = cv2.boundingRect(coords)  # find bounding box of non-zero coordinates
    return img[y : y + h, x : x + w]  # return image, cropped


def _s3_key_prefix():
    return "aseaman/images/jasper/jobs/{date}".format(
        date=datetime.datetime.now().date(),
    )


class DrawJasperLambdaHandler(APILambdaHandlerBase):
    action = "handle_upload"
    rest_enabled = False

    aws_config = AWSConfig(
        s3=S3Config(
            enabled=True,
            buckets=[
                S3BucketConfig(
                    name="public",
                    bucket_name=PUBLIC_BUCKET_NAME,
                    prefix=_s3_key_prefix,
                )
            ],
        )
    )

    def _init(self):
        self.id = uuid.uuid4().hex
        self.date = datetime.datetime.now()
        self.s3_key_prefix = "aseaman/images/jasper/jobs/{date}/{id}".format(
            date=datetime.datetime.now().date(),
            id=self.id,
        )
        self.s3_key_format = self.s3_key_prefix + f"/{id}" + "/{}"

    def s3_key_prefix(self):
        return "aseaman/images/jasper/jobs/{date}/{id}".format(
            date=datetime.datetime.now().date(),
            id=self.id,
        )

    def _download(self, key):
        tmpdir = tempfile.gettempdir()
        filename = key.split("/")[-1]
        local_filename = os.path.join(tmpdir, filename)
        with open(local_filename, "wb") as data:
            self.aws.s3.client.download_fileobj(PUBLIC_BUCKET_NAME, key, data)
        return local_filename

    def _download_all_masks(self):
        mask_response = self.aws.s3.client.list_objects_v2(
            Bucket=PUBLIC_BUCKET_NAME,
            MaxKeys=50,
            Prefix="{}/data/masks/".format(JASPER_PREFIX),
        )

        mask_keys = [
            file["Key"]
            for file in mask_response["Contents"]
            if file["Key"].endswith(".png")
        ]

        with futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_key = {
                executor.submit(self._download, key): key.split("/")[-1].split(".")[0]
                for key in mask_keys
            }

            for future in futures.as_completed(future_to_key):
                key = future_to_key[future]
                exception = future.exception()
                if not exception:
                    yield key, future.result()
                else:
                    yield key, exception

    def _save_file_to_local_temp(self):
        filename = "{}.png".format(self.id)
        tmpdir = tempfile.gettempdir()
        local_filename = os.path.join(tmpdir, filename)
        with open(local_filename, "wb") as fh:
            fh.write(self.img_bytes)

        return local_filename

    def _save_image_to_s3(self, img_bytes, filename):
        key = self.aws.s3.buckets["public"].put(
            file_bytes=img_bytes,
            filename=f"{self.id}/{filename}",
        )
        return key

    def _save_cv2_image_to_s3(self, cv2_image, filename, ext=".png"):
        img_bytes = cv2.imencode(ext, cv2_image)[1].tobytes()
        return self._save_image_to_s3(img_bytes, filename)

    def _run_comparison(self, drawing_file, mask_file):
        drawing = cv2.imread(drawing_file, cv2.IMREAD_GRAYSCALE)
        mask = cv2.imread(mask_file, cv2.IMREAD_GRAYSCALE)
        drawing_cropped = crop_to_content(drawing)
        mask_cropped = crop_to_content(mask, invert=False)

        cropped_return_path = self._save_cv2_image_to_s3(
            drawing_cropped, "cropped_drawing.png"
        )

        # Match their drawing size to ours
        # (this has to be before converting to black and white, I think there are interpolation issues)
        (drawing_height, drawing_width) = drawing_cropped.shape[:2]

        # Make ours the height of theirs, maintaining aspect ratio
        mask_sized = resize_by_height(mask_cropped, drawing_height)
        drawing_sized = cv2.bitwise_not(drawing_cropped)

        (_, mask_width) = mask_sized.shape[:2]

        # Find the larger
        larger_width = max(drawing_width, mask_width)
        smaller_width = min(drawing_width, mask_width)
        padding_left = math.floor((larger_width - smaller_width) / 2)
        padding_right = math.ceil((larger_width - smaller_width) / 2)
        if larger_width == drawing_width:
            mask_padded = cv2.copyMakeBorder(
                mask_sized,
                0,
                0,
                padding_left,
                padding_right,
                cv2.BORDER_CONSTANT,
                value=[0, 0, 0],
            )
            drawing_padded = drawing_sized
        else:
            drawing_padded = cv2.copyMakeBorder(
                drawing_sized,
                0,
                0,
                padding_left,
                padding_right,
                cv2.BORDER_CONSTANT,
                value=[0, 0, 0],
            )
            mask_padded = mask_sized
        difference = cv2.subtract(mask_padded, drawing_padded)
        difference_2 = cv2.subtract(drawing_padded, mask_padded)
        both_differences = cv2.add(difference, difference_2)
        non_zero_count = cv2.countNonZero(both_differences)

        difference_return_path = self._save_cv2_image_to_s3(
            both_differences, "difference.png"
        )

        return {
            "non_zero_count": non_zero_count,
            "differences": difference_return_path,
            "cropped_return_path": cropped_return_path,
            "difference_return_path": difference_return_path,
        }

    def handle_post(self):
        self.img_bytes = base64.b64decode(self.params["img"].split(",")[1])
        self._save_image_to_s3(self.img_bytes, "input_drawing.png")
        user_drawing_filename = self._save_file_to_local_temp()
        results = []
        for key, filepath in self._download_all_masks():
            comparison = self._run_comparison(user_drawing_filename, filepath)
            non_zero_count = comparison["non_zero_count"]
            comparison["matchId"] = key
            results.append((non_zero_count, comparison))

        result = {
            "results": sorted(results),
        }

        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "multiValueHeaders": {},
            "body": json.dumps(result),
        }


def lambda_handler(event, context):
    return DrawJasperLambdaHandler(event, context).handle()
