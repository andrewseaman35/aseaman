import json

from base.lambda_handler_base import APILambdaHandlerBase

TABLE_NAME = 'whisky_shelf'


class WhiskyShelfLambdaHandler(APILambdaHandlerBase):
    auth_actions = {
        'get_current_shelf': False,
        'add_to_shelf': True,
    }

    @property
    def require_auth(self):
        return self.auth_actions[self.action]

    def _init(self):
        self.actions = {
            'get_current_shelf': self._get_current_shelf,
            'add_to_shelf': self._add_to_shelf,
        }
        self.validation_actions = {
            'add_to_shelf': self._validate_add_to_shelf,
        }

    def _init_aws(self):
        self.ddb_client = self.aws_session.client('dynamodb', region_name='us-east-1')

    def _parse_payload(self, payload):
        self.action = payload.get('action')
        if not self.action:
            raise ValueError('action required')
        self.action = self.action.lower()
        if self.action not in self.actions:
            raise ValueError('invalid action')
        self.payload = payload.get('payload')

    def _validate_add_to_shelf(self):
        assert self.payload.get('distillery') is not None
        assert self.payload.get('internal_name') is not None

    def _add_to_shelf(self):
        self.ddb_client.put_item(
            TableName=TABLE_NAME,
            Item={
                'distillery': {
                    'S': self.payload['distillery'],
                },
                'internal_name': {
                    'S': self.payload['internal_name'],
                },
                'current': {
                    'BOOL': True,
                }
            }
        )

    def _get_current_shelf(self):
        ddb_items = self.ddb_client.scan(
            TableName=TABLE_NAME,
            ExpressionAttributeNames={
                '#dist': 'distillery',
                '#in': 'internal_name',
                '#cur': 'current',
            },
            ExpressionAttributeValues={
                ':true': {
                    'BOOL': True
                }
            },
            FilterExpression='#cur = :true',
            ProjectionExpression='#dist, #in'
        )['Items']
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
    return WhiskyShelfLambdaHandler(event, context).handle()
