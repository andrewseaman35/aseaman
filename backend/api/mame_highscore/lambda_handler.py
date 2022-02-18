import json
import os
import tempfile
import time
import os
import sys

# Required to support absolute imports when running locally and on lambda
CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import BadRequestException, UnauthorizedException

from high_score_parser import HighScoreParser


BUCKET_NAME = "aseaman-public-bucket"


class MameHighscoreLambdaHandler(APILambdaHandlerBase):
    require_auth = False
    rest_enabled = True
    primary_partition_key = 'user'

    def _init(self):
        self.s3_key_format = 'hi/{game_id}.hi'

    def _init_aws(self):
        self.s3_client = self.aws_session.client('s3', region_name='us-east-1')

    def _list_hiscore_files(self):
        response = self.s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix='hi/',
        )
        return response

    def _download(self, key):
        tmpdir = tempfile.gettempdir()
        filename = key.split('/')[-1]
        local_filename = os.path.join(tmpdir, filename)
        with open(local_filename, 'wb') as data:
            self.s3_client.download_fileobj(BUCKET_NAME, key, data)
        return local_filename

    def _get_metadata(self):
        files = []
        for file in [f for f in self._list_hiscore_files()['Contents'] if f['Key'] != 'hi/']:
            game_id = file['Key'].split('.hi')[0].split('hi/')[1]
            has_parser = HighScoreParser.implemented(game_id)
            game_name = HighScoreParser.get_game_title(game_id)

            files.append({
                'hasParser': has_parser,
                'gameName': game_name,
                'gameId': game_id,
                'lastModified': int(file['LastModified'].timestamp()),
            })

        def _sort(f):
            return (f['hasParser'], f['lastModified'], f['gameId'])

        metadata = {
            'parsers': HighScoreParser.get_games(),
            'games': sorted(files, key=_sort, reverse=True),
        }
        return metadata

    def _get_highscore_data_by_game_id(self, game_id):
        s3_key = self.s3_key_format.format(game_id=game_id)
        local_filename = self._download(s3_key)
        with open(local_filename, 'rb') as f:
            data = f.read()
        return data

    def _get_by_game_id(self, game_id):
        if not HighScoreParser.implemented(game_id):
            return {
                'errorMessage': '{} parser not set up'.format(game_id)
            }

        highscore_data = self._get_highscore_data_by_game_id(game_id)
        return HighScoreParser.parse(game_id, highscore_data)

    def _run(self):
        result = self.actions[self.action]()

        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "multiValueHeaders": {},
            "body": json.dumps(result)
        }

    def handle_get(self):
        path_parts = self.event['path'].strip('/').split('/')
        resource = path_parts[1] if len(path_parts) > 1 else None

        if resource == "metadata":
            result = self._get_metadata()
        elif resource ==  'score':
            game_id = self.params.get('game_id')
            if not game_id:
                raise Exception('game_id required')
            result = self._get_by_game_id(game_id)
        else:
            raise Exception('unsupported resource: {}'.format(resource))

        return {
            **self._empty_response(),
            'body': json.dumps(result)
        }

def lambda_handler(event, context):
    return MameHighscoreLambdaHandler(event, context).handle()
