import json
import os

import boto3
import requests

from base.lambda_handler_base import APILambdaHandlerBase


class RecipeAPILambdaHandler(APILambdaHandlerBase):
    def _init_aws(self):
        self.aws_session = boto3.session.Session(profile_name='aseaman')
        self.s3_client = self.aws_session.client('s3', region_name='us-east-1')

    def _parse_event(self, event):
        super(RecipeAPILambdaHandler, self)._parse_event(event)
        self.recipe_url = event.get('recipe_url')
        if not self.recipe_url:
            raise ValueError('missing recipe_url in event')

    def _run(self, event, context):
        print(" -- Received event --")
        print(json.dumps(event, indent=4))

        response = requests.get(self.recipe_url)

        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {},
            "multiValueHeaders": {},
            "body": "Recipes - {}".format(self.recipe_url)
        }


def lambda_handler(event, context):
    return RecipeAPILambdaHandler().handle(event, context)
