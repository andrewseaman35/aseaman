import json
import os

import boto3
import requests

from base.lambda_handler_base import APILambdaHandlerBase

TABLE_NAME = 'states'


class StateCheckAPILambdaHandler(APILambdaHandlerBase):
    def _init_aws(self):
        super(StateCheckAPILambdaHandler, self)._init_aws()
        self.ddb_client = self.aws_session.client('dynamodb', region_name='us-east-1')

    def _parse_payload(self, payload):
        self.state_id = payload.get('state_id')
        if not self.state_id:
            raise ValueError('missing state_id in event')

    def _get_state_data(self):
        ddb_item = self.ddb_client.get_item(
            TableName=TABLE_NAME,
            Key={
                'id': {
                    'S': self.state_id,
                }
            }
        )['Item']

        return {
            key: value_dict[value_dict.keys()[0]]
            for key, value_dict in ddb_item.items()
        }

    def _run(self):
        item = self._get_state_data()

        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {},
            "multiValueHeaders": {},
            "body": json.dumps(item)
        }


def lambda_handler(event, context):
    return StateCheckAPILambdaHandler(event, context).handle()
