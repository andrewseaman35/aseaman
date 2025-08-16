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
        resource = self.get_resource()
        response = self._empty_response()

        if resource == "event":
            event_id = self.params.get("id")
            item = self.aws.dynamodb.tables["splitomatic_event"].get(
                id=event_id,
                quiet=True,
            )
        else:
            raise NotImplementedError("Resource not implemented: {}".format(resource))

        return {
            **response,
            "body": json.dumps(item.to_dict() if item else {}),
        }

    def handle_post(self):
        resource = self.get_resource()
        response = self._empty_response()

        item = None
        if resource == "event":
            item = SplitomaticEventDDBItem.from_dict({"name": self.params.get("name")})
            item = self.aws.dynamodb.tables["splitomatic_event"].put(item)
        else:
            raise NotImplementedError("Resource not implemented: {}".format(resource))

        return {
            **self._empty_response(),
            "body": json.dumps(item.to_dict() if item else {"nuthing": "created"}),
        }

    def handle_put(self):
        return {**self._empty_response(), "body": json.dumps({})}

    def handle_delete(self):
        return {**self._empty_response(), "body": json.dumps({})}


def lambda_handler(event, context):
    return SplitomaticLambdaHandler(event, context).handle()
