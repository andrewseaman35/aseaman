import json


from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import (
    AWSConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
    S3Config,
    S3BucketConfig,
)
from base.api_exceptions import BadRequestException, NotFoundException

from base.dynamodb import (
    SplitomaticEventDDBItem,
    SplitomaticEventTable,
    SplitomaticUserTable,
    SplitomaticUserDDBItem,
    SplitomaticReceiptTable,
    SplitomaticReceiptDDBItem,
    SplitomaticReceiptItemTable,
    SplitomaticReceiptItemDDBItem,
    DynamoDBNotFoundException,
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

    def _get_event_json(self, event_id: str) -> dict:
        event = self.aws.dynamodb.tables["splitomatic_event"].get(
            id=event_id,
        )
        users = self.aws.dynamodb.tables["splitomatic_user"].scan(
            {"event_id": event_id},
        )
        receipts = self.aws.dynamodb.tables["splitomatic_receipt"].scan(
            {"event_id": event_id},
        )
        response = event.to_dict() if event else {}
        response["users"] = [user.to_dict() for user in users]
        response["receipts"] = [
            receipt.to_dict(
                include_computed=True,
                compute_services={
                    "s3_bucket": self.aws.s3.buckets["receipts"],
                },
            )
            for receipt in receipts
        ]
        return response

    def handle_get(self):
        resource = self.get_resource()
        empty_response = self._empty_response()

        if resource == "event":
            event_id = self.params.get("id")
            if not event_id:
                raise BadRequestException("`id` required.")
            try:
                response = self._get_event_json(event_id)
            except DynamoDBNotFoundException:
                raise NotFoundException(f"Event with id {event_id} not found")
        elif resource == "receipt":
            event_id = self.params.get("event_id")
            receipt_id = self.params.get("id")
            if not event_id or not receipt_id:
                raise BadRequestException("`event_id` and `receipt_id` required.")

            receipt = self.aws.dynamodb.tables["splitomatic_receipt"].get(
                event_id=event_id,
                id=receipt_id,
                quiet=True,
            )
            if not receipt:
                raise DynamoDBNotFoundException(
                    f"Receipt with event_id {event_id} and receipt_id {receipt_id} not found."
                )

            if receipt.status in {"PROCESSED"}:
                receipt_items = self.aws.dynamodb.tables[
                    "splitomatic_receipt_item"
                ].scan(
                    {"receipt_id": receipt.id},
                )

                response = receipt.to_dict(
                    include_computed=True,
                    compute_services={"s3_bucket": self.aws.s3.buckets["receipts"]},
                )
                response["items"] = [
                    receipt_item.to_dict() for receipt_item in receipt_items
                ]
        elif resource == "summary":
            event_id = self.params.get("event_id")
            if not event_id:
                raise ValueError("Event id is required for summary.")

            receipts = self.aws.dynamodb.tables["splitomatic_receipt"].scan(
                {"event_id": event_id},
            )
            receipt_items = self.aws.dynamodb.tables["splitomatic_receipt_item"].scan(
                {"event_id": event_id},
            )
            users = self.aws.dynamodb.tables["splitomatic_user"].scan(
                {"event_id": event_id},
            )

            claimed_by_user = {user.id: [] for user in users}
            for receipt_item in receipt_items:
                for user_id in [c["S"] for c in receipt_item.claimed_by]:
                    claimed_by_user[user_id].append(receipt_item.id)

            totals = {}
            for user in users:
                totals[user.id] = {
                    "claimed_item_count": 0,
                    "total": 0,
                }
                claimed_items = claimed_by_user[user.id]
                for receipt_item in receipt_items:
                    if receipt_item.id in claimed_items:
                        totals[user.id]["claimed_item_count"] += 1
                        totals[user.id]["total"] += float(receipt_item.total)

            response = {
                "event_id": event_id,
                "receipts": [
                    receipt.to_dict(
                        include_computed=True,
                        compute_services={"s3_bucket": self.aws.s3.buckets["receipts"]},
                    )
                    for receipt in receipts
                ],
                "receipt_items": [
                    receipt_item.to_dict() for receipt_item in receipt_items
                ],
                "users": [user.to_dict() for user in users],
                "totals": totals,
            }
        else:
            raise NotImplementedError("Resource not implemented: {}".format(resource))

        return {
            **empty_response,
            "body": json.dumps(response),
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
                    "uploader_user_id": self.params.get("user_id", "unknown"),
                    "payer_user_id": self.params.get("payer_user_id", "unknown"),
                    "status": "PENDING",
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

        elif resource == "claim":
            receipt_id = self.params.get("receipt_id")
            item_id = self.params.get("item_id")
            user_id = self.params.get("user_id")
            claim = self.params.get("claim", False)

            receipt_item = self.aws.dynamodb.tables["splitomatic_receipt_item"].get(
                receipt_id=receipt_id,
                id=item_id,
            )
            claimed_by = (
                [c["S"] for c in receipt_item.claimed_by] if receipt_item else []
            )

            if claim:
                update_dict = {
                    "claimed_by": {
                        "value": [{"S": user_id}],
                        "operation": "list_append",
                    },
                }
            else:
                new_claimed_by_user_ids = [uid for uid in claimed_by]
                if user_id in new_claimed_by_user_ids:
                    new_claimed_by_user_ids.remove(user_id)

                update_dict = {
                    "claimed_by": {
                        "value": [{"S": uid} for uid in new_claimed_by_user_ids],
                        "operation": "SET",
                    },
                }

            receipt_item = self.aws.dynamodb.tables["splitomatic_receipt_item"].update(
                SplitomaticReceiptItemDDBItem.build_ddb_key(
                    receipt_id=receipt_id, id=item_id
                ),
                update_dict,
            )

            receipt_item = self.aws.dynamodb.tables["splitomatic_receipt_item"].get(
                receipt_id=receipt_id,
                id=item_id,
            )

            response = receipt_item.to_dict()

        if resource == "item":
            receipt_id = self.params.get("receipt_id")
            item_id = self.params.get("item_id")
            quantity = self.params.get("quantity")
            name = self.params.get("name")

            update_dict = {}
            if quantity and int(quantity) > 0:
                update_dict["quantity"] = {
                    "value": str(quantity),
                    "operation": "SET",
                }
            if name is not None:
                update_dict["item_name"] = {
                    "value": name,
                    "operation": "SET",
                }
            if not update_dict:
                raise BadRequestException(
                    "At least one of `quantity` or `name` is required."
                )

            receipt_item = self.aws.dynamodb.tables["splitomatic_receipt_item"].update(
                SplitomaticReceiptItemDDBItem.build_ddb_key(
                    receipt_id=receipt_id, id=item_id
                ),
                update_dict,
            )

            receipt_item = self.aws.dynamodb.tables["splitomatic_receipt_item"].get(
                receipt_id=receipt_id,
                id=item_id,
            )

            response = receipt_item.to_dict()

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
