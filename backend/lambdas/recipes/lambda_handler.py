import json
import os

import boto3
import requests

from base.lambda_handler_base import APILambdaHandlerBase


class RecipeAPILambdaHandler(APILambdaHandlerBase):

    def _run(self, event, context):
        print(" -- Received event --")
        print(json.dumps(event, indent=4))
        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {},
            "multiValueHeaders": {},
            "body": "Recipes"
        }


def lambda_handler(event, context):
    return RecipeAPILambdaHandler().handle(event, context)
