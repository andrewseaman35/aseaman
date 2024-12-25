import csv
from dataclasses import dataclass

from base.lambda_handler_base import JobLambdaHandlerBase, CREATION_EVENT_NAME
from base.aws import (
    AWSConfig,
    S3Config,
    S3BucketConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
)
from base.dynamodb import BudgetFileTable, BudgetFileEntryTable
from base.helpers import get_timestamp


UPLOADS_PREFIX = "budget/uploads"
CONFIG_PREFIX = "budget/config"


@dataclass
class FileState:
    UPLOADED = "uploaded"
    IMPORTED = "imported"
    PROCESSED = "processed"


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
                ),
                S3BucketConfig(
                    name="configs",
                    bucket_name="aseaman-protected",
                    prefix=CONFIG_PREFIX,
                ),
            ],
        ),
    )

    def _init(self):
        self.uploads_prefix = UPLOADS_PREFIX
        self.prefix = UPLOADS_PREFIX

    def override_category(self, original_category):
        return original_category

    def _get_entries(self, owner, filepath):
        entries = []
        timestamp = get_timestamp()
        with open(filepath, newline="") as csvfile:
            reader = csv.reader(csvfile, delimiter=",", quotechar="|")
            next(reader, None)
            for row in reader:
                entries.append(
                    BudgetFileEntryDDBItem.from_row(
                        row,
                        owner=owner,
                        override_category=self.override_category,
                        timestamp=timestamp,
                    )
                )
        return entries

    def _handle_created(self, created):
        print(f"Handling: {created}")
        key = f"{UPLOADS_PREFIX}/{created}"
        environment = created.split("/")[0]
        owner = created.split("/")[1]

        filepath = self.aws.s3.buckets["uploads"].download(key)
        print("Downloaded")

        file_entries = self._get_entries(owner, filepath)
        print(f"{len(file_entries)} retrieved")
        ids = set()
        deduped_entries = []
        for entry in file_entries:
            if entry.id in ids:
                continue
            ids.add(entry.id)
            deduped_entries.append(entry)

        self.aws.dynamodb.tables["budget_file_entry"].bulk_put(deduped_entries)

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


# event = {'Records': [{'eventVersion': '2.1', 'eventSource': 'aws:s3', 'awsRegion': 'us-east-1', 'eventTime': '2024-12-24T21:24:29.234Z', 'eventName': 'ObjectCreated:Put', 'userIdentity': {'principalId': 'AWS:AIDAJDNB5MJJIJIUWHFYC'}, 'requestParameters': {'sourceIPAddress': '75.11.10.172'}, 'responseElements': {'x-amz-request-id': 'WH161H7AEN93KHRB', 'x-amz-id-2': 'pQXj5hE39T5SgdnG5mXt8cFnT9GVAorSPAg0ikfSBSNobJSCflKgm2bYZsSFNI0v8wiNrwanSPW9Zqujq4q8UdWDmrDNpPaa'}, 's3': {'s3SchemaVersion': '1.0', 'configurationId': 'tf-s3-lambda-20241224212403804500000002', 'bucket': {'name': 'aseaman-protected', 'ownerIdentity': {'principalId': 'A3QM71HR4ZP65N'}, 'arn': 'arn:aws:s3:::aseaman-protected'}, 'object': {'key': 'budget/uploads/local/andrew/9134e44d3ad248d796b4604244ea3dce', 'size': 3307, 'eTag': '6f9743a310f39d815641a3392982e9cf', 'sequencer': '00676B268D0D3693BE'}}}]}
# lambda_handler(event, {})
