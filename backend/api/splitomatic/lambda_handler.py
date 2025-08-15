import json


from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import AWSConfig, DynamoDBConfig


class SplitomaticLambdaHandler(APILambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[],
        )
    )

    def handle_get(self):
        response = self._empty_response()

        return {
            **response,
            "body": json.dumps({}),
        }

    def handle_post(self):

        return {**self._empty_response(), "body": json.dumps({})}

    def handle_put(self):
        return {**self._empty_response(), "body": json.dumps({})}

    def handle_delete(self):
        return {**self._empty_response(), "body": json.dumps({})}


def lambda_handler(event, context):
    return SplitomaticLambdaHandler(event, context).handle()
