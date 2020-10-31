import json
import time

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import BadRequestException, UnauthorizedException

TABLE_NAME = 'mame_highscores'
LOCAL_TABLE_NAME = 'mame_highscores_local'

class MameHighscoreLambdaHandler(APILambdaHandlerBase):
    require_auth = False
    primary_partition_key = 'user'

    def _init(self):
        self.table_name = LOCAL_TABLE_NAME if self.is_local else TABLE_NAME
        self.actions = {
            'save': self._create,
            'get_by_game_id': self._get_by_game_id,
            'list': self._list,
        }
        self.validation_actions = {
            'save': self._validate_create,
            'get_by_game_id': self._validate_get_by_game_id,
            'list': self._validate_list,
        }

    def _init_aws(self):
        self.ddb_client = self.aws_session.client('dynamodb', region_name='us-east-1')

    def _parse_payload(self, payload):
        self.action = payload.get('action')
        if not self.action:
            raise BadRequestException('action parameter required')
        self.action = self.action.lower()
        if self.action not in self.actions:
            raise BadRequestException('invalid action')
        self.payload = payload.get('payload')

    def _validate_create(self):
        # this should get the user and valuidate against the key
        self.user = self.payload.get('user')
        if self.user is None:
            raise BadRequestException('user parameter required')

        self.game_id = self.payload.get('game_id')
        if self.game_id is None:
            raise BadRequestException('game_id parameter required')

        self.score = self.payload.get('score')
        if self.score is None:
            raise BadRequestException('score parameter required')

        self.secret_key = self.payload.get('secret_key')
        if self.secret_key is None:
            raise BadRequestException('secret_key parameter required')

    def _validate_get_by_game_id(self):
        # this should get the user and valuidate against the key
        self.user = self.payload.get('user')
        if self.user is None:
            raise BadRequestException('user parameter required')

        self.game_id = self.payload.get('game_id')
        if self.game_id is None:
            raise BadRequestException('game_id parameter required')

        self.secret_key = self.payload.get('secret_key')
        if self.secret_key is None:
            raise BadRequestException('secret_key parameter required')

    def _validate_list(self):
        return True
        self.user = self.payload.get('user')

    def _build_key(self, game_id, user):
        return {
            'game_id': {
                'S': game_id,
            },
            'user': {
                'S': user,
            },
        }

    def _build_new_ddb_item(self, game_id, user, score, timestamp):
        return {
            'game_id': {
                'S': game_id,
            },
            'user': {
                'S': user,
            },
            'score': {
                'N': str(score),
            },
            'timestamp': {
                'N': str(int(time.time())),
            },
        }

    def _create(self):
        print("New entry for: {}, {}".format(self.game_id, self.user))
        ddbItem = self._build_new_ddb_item(self.game_id, self.user, self.score, 123)
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=ddbItem,
        )
        return {
            'game_id': ddbItem['game_id'],
            'user': ddbItem['user'],
            'score': ddbItem['score'],
            'timestamp': ddbItem['timestamp'],
        }

    def _scan_all(self):
        return self.ddb_client.scan(
            TableName=self.table_name,
        )['Items']

    def _scan_by_user(self):
        return self.ddb_client.scan(
            TableName=self.table_name,
            ExpressionAttributeNames={
                '#wsid': 'user',
            },
            ExpressionAttributeValues={
                ':wsid': {
                    'S': self.user,
                },
            },
            FilterExpression='#wsid = :wsid',
        )['Items']

    def _scan_by_game_id(self):
        return self.ddb_client.scan(
            TableName=self.table_name,
            ExpressionAttributeNames={
                '#gid': 'game_id',
            },
            ExpressionAttributeValues={
                ':gid': {
                    'S': self.game_id,
                },
            },
            FilterExpression='#gid = :gid',
        )['Items']
        

    def _get_by_game_id(self):
        ddb_items = self._scan_by_game_id()
        items = [
            {
                key: value[list(value.keys())[0]]
                for key, value in ddb_item.items()
            } for ddb_item in ddb_items
        ]
        return sorted(items, key=lambda i: float(i['score']), reverse=True)

    def _list(self):
        ddb_items = self._scan_by_user() if self.user else self._scan_all()
        items = [
            {
                key: value[list(value.keys())[0]]
                for key, value in ddb_item.items()
            } for ddb_item in ddb_items
        ]
        return items

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
