import json


from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import (
    AWSConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
    S3Config,
    S3BucketConfig,
)

from base.dynamodb import (
    SplitomaticEventDDBItem,
    SplitomaticEventTable,
    SplitomaticUserTable,
    SplitomaticUserDDBItem,
    SplitomaticReceiptTable,
    SplitomaticReceiptDDBItem,
    SplitomaticReceiptItemTable,
    SplitomaticReceiptItemDDBItem,
)

ACCEPTED_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "application/pdf",
}


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
                DynamoDBTableConfig(
                    "splitomatic_receipt_item",
                    SplitomaticReceiptItemTable,
                ),
            ],
        ),
        s3=S3Config(
            enabled=True,
            buckets=[
                S3BucketConfig("receipts", "aseaman-protected", "splitomatic/receipts"),
            ],
        ),
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
            item["receipts"] = [
                receipt.to_dict(
                    include_computed=True,
                    compute_services={
                        "s3_bucket": self.aws.s3.buckets["receipts"],
                    },
                )
                for receipt in receipts
            ]
        else:
            raise NotImplementedError("Resource not implemented: {}".format(resource))

        return {
            **response,
            "body": json.dumps(item),
        }

    def handle_post(self):
        headers = self.get_headers()
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

            event = SplitomaticEventDDBItem.from_dict({"name": self.params.get("name")})
            event_item = self.aws.dynamodb.tables["splitomatic_event"].put(event)

            user_items = []
            for user in users:
                user_ddb_item = SplitomaticUserDDBItem.from_dict(
                    {"name": user, "event_id": event_item.id}
                )
                user_items.append(
                    self.aws.dynamodb.tables["splitomatic_user"].put(user_ddb_item)
                )

            response = event_item.to_dict()
            response["users"] = [user.to_dict() for user in user_items]
            response["receipts"] = []

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
            content_type = headers["Content-Type"]
            if content_type not in ACCEPTED_CONTENT_TYPES:
                raise ValueError(f"unsupported content type {content_type}")

            key = self.aws.s3.buckets["receipts"].put(
                file_bytes=self.params["body"],
                filename=f"{self.env}/{event_id}/{item.id}",
                content_type=content_type,
                remove_prefix=False,
            )
            item.set_attribute("s3_key", key)
            item = self.aws.dynamodb.tables["splitomatic_receipt"].put(item)
            response = {
                "status": "OK Go!",
                "data": item.to_dict(
                    include_computed=True,
                    compute_services={"s3_bucket": self.aws.s3.buckets["receipts"]},
                ),
            }

            stub_receipt_items = [
                SplitomaticReceiptItemDDBItem.from_dict(
                    {
                        "receipt_id": item.id,
                        "name": f"Stub Item {item_number}",
                        "amount": item_number,
                        "quantity": item_number,
                    }
                )
                for item_number in range(1, 4)
            ]
            self.aws.dynamodb.tables["splitomatic_receipt_item"].bulk_put(
                stub_receipt_items
            )

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
