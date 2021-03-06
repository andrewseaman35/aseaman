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
    primary_partition_key = 'user'

    def _init(self):
        self.s3_key_format = 'hi/{game_id}.hi'

        self.actions = {
            'metadata': self._get_metadata,
            'get_by_game_id': self._get_by_game_id,
            'list': self._list,
        }
        self.validation_actions = {
            'get_by_game_id': self._validate_get_by_game_id,
            'list': self._validate_list,
        }

    def _init_aws(self):
        self.s3_client = self.aws_session.client('s3', region_name='us-east-1')

    def _parse_payload(self, payload):
        self.action = payload.get('action')
        if not self.action:
            raise BadRequestException('action parameter required')
        self.action = self.action.lower()
        if self.action not in self.actions:
            raise BadRequestException('invalid action')
        self.payload = payload.get('payload')

    def _validate_get_by_game_id(self):
        self.game_id = self.payload.get('game_id')
        if self.game_id is None:
            raise BadRequestException('game_id parameter required')

    def _validate_list(self):
        return True

    def _list(self):
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
        for file in [f for f in self._list()['Contents'] if f['Key'] != 'hi/']:
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

    def _get_by_game_id(self):
        game_id = self.payload['game_id']
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


def lambda_handler(event, context):
    return MameHighscoreLambdaHandler(event, context).handle()
