import json


from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import AWSConfig, DynamoDBConfig, DynamoDBTableConfig

from base.dynamodb import SplitomaticEventDDBItem, SplitomaticEventTable


class SplitomaticLambdaHandler(APILambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig(
                    "splitomatic_event",
                    SplitomaticEventTable,
                ),
            ],
        )
    )

    def handle_get(self):
        response = self._empty_response()

        event = self.aws.dynamodb.tables["splitomatic_event"].get(
            id="6JDQMT",
            quiet=True,
        )

        return {
            **response,
            "body": json.dumps(event.to_dict() if event else {}),
        }

    def handle_post(self):

        return {**self._empty_response(), "body": json.dumps({})}

    def handle_put(self):
        return {**self._empty_response(), "body": json.dumps({})}

    def handle_delete(self):
        return {**self._empty_response(), "body": json.dumps({})}


def lambda_handler(event, context):
    return SplitomaticLambdaHandler(event, context).handle()
