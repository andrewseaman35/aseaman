import json


from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import AWSConfig, DynamoDBConfig, DynamoDBTableConfig

from base.dynamodb import (
    SplitomaticEventDDBItem,
    SplitomaticEventTable,
    SplitomaticUserTable,
    SplitomaticUserDDBItem,
    SplitomaticReceiptTable,
    SplitomaticReceiptDDBItem,
)


class SplitomaticLambdaHandler(APILambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig(
                    "splitomatic_event",
                    SplitomaticEventTable,
                ),
                DynamoDBTableConfig(
                    "splitomatic_user",
                    SplitomaticUserTable,
                ),
                DynamoDBTableConfig(
                    "splitomatic_receipt",
                    SplitomaticReceiptTable,
                ),
            ],
        )
    )

    def handle_get(self):
        resource = self.get_resource()
        response = self._empty_response()

        if resource == "event":
            event_id = self.params.get("id")
            event = self.aws.dynamodb.tables["splitomatic_event"].get(
                id=event_id,
                quiet=True,
            )
            users = self.aws.dynamodb.tables["splitomatic_user"].scan(
                {"event_id": event_id},
            )
            receipts = self.aws.dynamodb.tables["splitomatic_receipt"].scan(
                {"event_id": event_id},
            )
            item = event.to_dict() if event else {}
            item["users"] = [user.to_dict() for user in users]
            item["receipts"] = [receipt.to_dict() for receipt in receipts]
        else:
            raise NotImplementedError("Resource not implemented: {}".format(resource))

        return {
            **response,
            "body": json.dumps(item),
        }

    def handle_post(self):
        resource = self.get_resource()
        response = self._empty_response()

        item = None
        if resource == "event":
            users = (
                self.params.get("users", "").split(",")
                if self.params.get("users")
                else []
            )
            if not users:
                raise ValueError("Users parameter is required for creating an event.")

            lower_users = [user.lower() for user in users]
            if len(lower_users) != len(set(lower_users)):
                raise ValueError("Users must be unique.")

            item = SplitomaticEventDDBItem.from_dict({"name": self.params.get("name")})
            item = self.aws.dynamodb.tables["splitomatic_event"].put(item)

            for user in users:
                user_ddb_item = SplitomaticUserDDBItem.from_dict(
                    {"name": user, "event_id": item.id}
                )
                self.aws.dynamodb.tables["splitomatic_user"].put(user_ddb_item)

            response = item.to_dict()
        elif resource == "receipt_upload":
            event_id = self.get_secondary_resource()
            if not event_id:
                raise ValueError("Event ID is required for uploading a receipt.")

            item = SplitomaticReceiptDDBItem.from_dict(
                {
                    "event_id": event_id,
                    "status": "UPLOADED",
                }
            )
            item = self.aws.dynamodb.tables["splitomatic_receipt"].put(item)
            response = {"status": "OK!", "data": item.to_dict()}

        else:
            raise NotImplementedError("Resource not implemented: {}".format(resource))

        return {
            **self._empty_response(),
            "body": json.dumps(response),
        }

    def handle_put(self):
        return {**self._empty_response(), "body": json.dumps({})}

    def handle_delete(self):
        return {**self._empty_response(), "body": json.dumps({})}


def lambda_handler(event, context):
    return SplitomaticLambdaHandler(event, context).handle()
