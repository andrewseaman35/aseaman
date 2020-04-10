import json
import os

import boto3
import requests

from base.lambda_handler_base import APILambdaHandlerBase


class RecipeAPILambdaHandler(APILambdaHandlerBase):
    def _init_aws(self):
        super(RecipeAPILambdaHandler, self)._init_aws()
        self.s3_client = self.aws_session.client('s3', region_name='us-east-1')

    def _parse_payload(self, payload):
        self.recipe_url = payload.get('recipe_url')
        if not self.recipe_url:
            raise ValueError('missing recipe_url in event')

    def _run(self):
        response = requests.get(self.recipe_url)

        response_body = {
            "received": "Recipes - {}".format(self.recipe_url),
            "response_length": len(response.content)
        }
        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {},
            "multiValueHeaders": {},
            "body": json.dumps(response_body)
        }


def lambda_handler(event, context):
    return RecipeAPILambdaHandler(event, context).handle()
