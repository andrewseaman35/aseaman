import json

from base.lambda_handler_base import APILambdaHandlerBase

TABLE_NAME = 'states'


class StateCheckAPILambdaHandler(APILambdaHandlerBase):
    # REQUIRE_AUTH = False

    def _init_aws(self):
        self.ddb_client = self.aws_session.client('dynamodb', region_name='us-east-1')

    def _parse_payload(self, payload):
        self.state_id = payload.get('state_id')
        if not self.state_id:
            raise ValueError('missing state_id in event')

    def _get_state_data(self):
        common_keys = {'id', 'time_updated'}
        ddb_item = self.ddb_client.get_item(
            TableName=TABLE_NAME,
            Key={
                'id': {
                    'S': self.state_id,
                }
            }
        )['Item']

        result = {
            key: ddb_item.pop(key)['S'] for key in common_keys
        }
        data = {
            key: value[list(value.keys())[0]] for key, value in ddb_item.items()
        }
        result['data'] = data
        return result

    def _run(self):
        item = self._get_state_data()

        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "multiValueHeaders": {},
            "body": json.dumps(item)
        }


def lambda_handler(event, context):
    return StateCheckAPILambdaHandler(event, context).handle()
