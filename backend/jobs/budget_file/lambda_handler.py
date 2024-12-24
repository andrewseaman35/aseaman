import csv
from dataclasses import dataclass
import datetime
import hashlib

from base.lambda_handler_base import JobLambdaHandlerBase, CREATION_EVENT_NAME
from base.aws import (
    AWSConfig,
    S3Config,
    S3BucketConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
)
from base.dynamodb import DynamoDBItem, DynamoDBItemValueConfig, DynamoDBTable
from base.helpers import generate_id, get_timestamp


UPLOADS_PREFIX = "budget/uploads"


@dataclass
class FileState:
    UPLOADED = "uploaded"
    IMPORTED = "imported"
    PROCESSED = "processed"


class BudgetFileEntryDDBItem(DynamoDBItem):
    _config = {
        "owner": DynamoDBItemValueConfig("S"),
        "id": DynamoDBItemValueConfig("S"),
        "transaction_date": DynamoDBItemValueConfig("S"),
        "post_date": DynamoDBItemValueConfig("S"),
        "description": DynamoDBItemValueConfig("S", default=None),
        "original_category": DynamoDBItemValueConfig("S", default=None),
        "category": DynamoDBItemValueConfig("S"),
        "transaction_type": DynamoDBItemValueConfig("S"),
        "amount": DynamoDBItemValueConfig("N"),
    }

    @classmethod
    def generate_id_from_row(cls, row):
        row_bytes = "|".join(row).encode("utf-8")
        hash_object = hashlib.sha256(row_bytes)
        return hash_object.hexdigest()

    @classmethod
    def from_row(cls, row, owner, override_category):
        hash_ = cls.generate_id_from_row(row)

        return cls(
            {
                "owner": owner,
                "id": hash_,
                "transaction_date": row[0],
                "post_date": row[1],
                "description": row[2],
                "original_category": row[3],
                "category": override_category(row[3]),
                "transaction_type": row[4],
                "amount": float(row[5]),
            }
        )


class BudgetFileEntryTable(DynamoDBTable):
    ItemClass = BudgetFileEntryDDBItem


class BudgetFileDDBItem(DynamoDBItem):
    _config = {
        "owner": DynamoDBItemValueConfig("S"),
        "id": DynamoDBItemValueConfig("S", default=generate_id),
        "state": DynamoDBItemValueConfig("S"),
        "s3_key": DynamoDBItemValueConfig("S", internal=True),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None),
    }

    @property
    def ddb_key(self):
        return self.build_ddb_key(owner=self.owner, s3_key=self.s3_key)

    @classmethod
    def build_ddb_key(cls, *args, owner=None, s3_key=None, **kwargs):
        assert owner is not None, "owner required to build ddb key"
        assert s3_key is not None, "s3_key required to build ddb key"
        return {
            "owner": {
                "S": owner,
            },
            "s3_key": {"S": s3_key},
        }


class BudgetFileTable(DynamoDBTable):
    ItemClass = BudgetFileDDBItem


class BudgetFileLambdaHandler(JobLambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig(
                    name="budget_file",
                    TableClass=BudgetFileTable,
                ),
                DynamoDBTableConfig(
                    name="budget_file_entry",
                    TableClass=BudgetFileEntryTable,
                ),
            ],
        ),
        s3=S3Config(
            enabled=True,
            buckets=[
                S3BucketConfig(
                    name="uploads",
                    bucket_name="aseaman-protected",
                    prefix=UPLOADS_PREFIX,
                )
            ],
        ),
    )

    def _init(self):
        self.prefix = UPLOADS_PREFIX

    def override_category(self, original_category):
        return original_category

    def _get_entries(self, owner, filepath):
        entries = []
        with open(filepath, newline="") as csvfile:
            reader = csv.reader(csvfile, delimiter=",", quotechar="|")
            next(reader, None)
            for row in reader:
                entries.append(
                    BudgetFileEntryDDBItem.from_row(
                        row, owner=owner, override_category=self.override_category
                    )
                )
        return entries

    def _handle_created(self, created):
        print(f"Handling: {created}")
        key = f"{self.prefix}/{created}"
        owner = created.split("/")[1]

        filepath = self.aws.s3.buckets["uploads"].download(key)
        print("Downloaded")

        file_entries = self._get_entries(owner, filepath)
        print(f"{len(file_entries)} retrieved")
        self.aws.dynamodb.tables["budget_file_entry"].bulk_put(file_entries)

        scan_dict = {
            "owner": owner,
            "s3_key": created,
        }
        print(scan_dict)
        records = self.aws.dynamodb.tables["budget_file"].scan(scan_dict=scan_dict)
        if len(records) == 0:
            raise Exception(f"No records found for {scan_dict}")
        elif len(records) > 1:
            raise Exception(f"Multiple records found for {scan_dict}")

        record = records[0]
        update_dict = {
            "state": {
                "value": FileState.IMPORTED,
                "operation": "SET",
            },
        }
        print(f"Key: {record.ddb_key}")
        self.aws.dynamodb.tables["budget_file"].update(
            key=record.ddb_key,
            update_dict=update_dict,
        )

    def _run(self, changes):
        for created in changes[CREATION_EVENT_NAME]:
            self._handle_created(created)


def lambda_handler(event, context):
    return BudgetFileLambdaHandler(event, context).handle()


# event = {'Records': [{'eventVersion': '2.1', 'eventSource': 'aws:s3', 'awsRegion': 'us-east-1', 'eventTime': '2024-12-24T03:50:16.780Z', 'eventName': 'ObjectCreated:Put', 'userIdentity': {'principalId': 'AWS:AIDAJDNB5MJJIJIUWHFYC'}, 'requestParameters': {'sourceIPAddress': '75.11.10.172'}, 'responseElements': {'x-amz-request-id': 'XZ9FYXXPQA300ZHF', 'x-amz-id-2': 'G6oY+FgKzEyaEo0DqkFxgkXNGPBFFbH/S76VeuZc91tsRkfzlaBiIXJir3dfwqSKYduwjXzNV2FvHE9zsj2+P5MNkvPj3e97'}, 's3': {'s3SchemaVersion': '1.0', 'configurationId': 'tf-s3-lambda-20241224032918392100000001', 'bucket': {'name': 'aseaman-protected', 'ownerIdentity': {'principalId': 'A3QM71HR4ZP65N'}, 'arn': 'arn:aws:s3:::aseaman-protected'}, 'object': {'key': 'budget/uploads/local/andrew/6dfae7fd1e8444e7aaaf2a56a236f357', 'size': 460631, 'eTag': 'b4c75235a49b37f9d39254cc33c39d8c', 'sequencer': '00676A2F77261D51E6'}}}]}
# lambda_handler(event, {})
