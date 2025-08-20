import os

from base.lambda_handler_base import JobLambdaHandlerBase, CREATION_EVENT_NAME
from base.aws import (
    AWSConfig,
    S3Config,
    S3BucketConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
)
from base.dynamodb import (
    SplitomaticReceiptItemDDBItem,
    SplitomaticReceiptTable,
    SplitomaticReceiptItemTable,
    SplitomaticReceiptDDBItem,
)

from veryfi_client import VeryfiClient


class SplitomaticLambdaHandler(JobLambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
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

    def _init(self):
        self.verify_client = VeryfiClient(
            client_id=os.getenv("VERYFI_CLIENT_ID") or "",
            auth_token=os.getenv("VERYFI_AUTH_TOKEN") or "",
            verify_username=os.getenv("VERYFI_USERNAME") or "andrewseaman35",
        )
        return super()._init()

    def _handle_created(self, event_id, receipt_id):
        receipt = self.aws.dynamodb.tables["splitomatic_receipt"].get(
            event_id=event_id,
            id=receipt_id,
        )
        print(f"Receipt: {receipt}")
        download_url = receipt.get_presigned_url(
            self.aws.s3.buckets["receipts"],
        )
        print("Download url:", download_url)

        parsed_receipt = self.verify_client.extract_via_verify(download_url)
        print(parsed_receipt)

        receipt_items = [
            SplitomaticReceiptItemDDBItem.from_dict(
                {
                    "event_id": event_id,
                    "receipt_id": receipt_id,
                    "item_name": item["description"],
                    "total": item["total"],
                    "quantity": item["quantity"],
                    "claimed_by": [],
                }
            )
            for item in parsed_receipt["line_items"]
        ]

        self.aws.dynamodb.tables["splitomatic_receipt_item"].bulk_put(receipt_items)
        print(f"{len(receipt_items)} items stored")

        receipt = self.aws.dynamodb.tables["splitomatic_receipt"].get(
            event_id=event_id,
            id=receipt_id,
            quiet=True,
        )

        update_dict = {
            "status": {
                "value": "PROCESSED",
                "operation": "SET",
            },
        }
        self.aws.dynamodb.tables["splitomatic_receipt"].update(
            key=receipt.build_ddb_key(
                event_id=event_id,
                id=receipt_id,
            ),
            update_dict=update_dict,
        )
        print(f"State updated: {receipt_id}")

    def _get_download_url(self, created):
        print(created)
        return "www.created.com"

    def _run(self, changes):
        print(f"Processing {len(changes[CREATION_EVENT_NAME])} creation events")
        for path in changes[CREATION_EVENT_NAME]:
            try:
                receipt_id = path.split("/")[-1]
                event_id = path.split("/")[-2]
                print(f"Event id {event_id}; receipt id {receipt_id}")
                self._handle_created(event_id, receipt_id)
            except Exception as e:
                update_dict = {
                    "state": {
                        "value": "FAILED",
                        "operation": "SET",
                    },
                }
                self.aws.dynamodb.tables["splitomatic_receipt"].update(
                    key=SplitomaticReceiptDDBItem.build_ddb_key(
                        event_id=event_id,
                        id=receipt_id,
                    ),
                    update_dict=update_dict,
                )
                raise e


def lambda_handler(event, context):
    return SplitomaticLambdaHandler(event, context).handle()


event = {
    "Records": [
        {
            "eventVersion": "2.1",
            "eventSource": "aws:s3",
            "awsRegion": "us-east-1",
            "eventTime": "2025-08-20T03:49:58.444Z",
            "eventName": "ObjectCreated:Put",
            "userIdentity": {"principalId": "AWS:AIDAJDNB5MJJIJIUWHFYC"},
            "requestParameters": {"sourceIPAddress": "75.11.10.172"},
            "responseElements": {
                "x-amz-request-id": "9VRT8VSETX6J1Z6S",
                "x-amz-id-2": "XTiH6g0xkZznchOtOMlmDFW98ko9oIaqjUZiUHqNqM372uzxkQcDd0d7HCWVmzc3CLZ8fhOQ9RebM/Mx/R/eKPzbD/asozUs",
            },
            "s3": {
                "s3SchemaVersion": "1.0",
                "configurationId": "tf-s3-lambda-20250820032154096500000001",
                "bucket": {
                    "name": "aseaman-protected",
                    "ownerIdentity": {"principalId": "A3QM71HR4ZP65N"},
                    "arn": "arn:aws:s3:::aseaman-protected",
                },
                "object": {
                    "key": "splitomatic/receipts/local/25543dc325a14f9fa81c470bd7326b50/0f49238022c7433bb6f9399a3ce64736",
                    "size": 2016010,
                    "eTag": "b08c74586efaad3751ff83006b74468e",
                    "versionId": "hkhlu9dP_SeZ9hqlAWH4kZYfcMFljApB",
                    "sequencer": "0068A545E5569EA304",
                },
            },
        }
    ]
}
lambda_handler(event, {})
