import csv
from dataclasses import dataclass
import re

from pypdf import PdfReader

from base.lambda_handler_base import JobLambdaHandlerBase, CREATION_EVENT_NAME
from base.aws import (
    AWSConfig,
    S3Config,
    S3BucketConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
)
from base.dynamodb import BudgetFileTable, BudgetFileEntryTable, BudgetFileEntryDDBItem
from base.helpers import get_timestamp


UPLOADS_PREFIX = "budget/uploads"
CONFIG_PREFIX = "budget/config"

PDF_LINE_REGEX = r"^(\d+\/\d+)     (.* )(-?\d+.\d\d)$"
YEAR_REGEX = r"^Payment Due Date: 11\/11\/(\d\d)$"


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

    def _get_csv_entries(self, owner, filepath):
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
                        timestamp=timestamp,
                    )
                )
        return entries

    def _extract_pdf_year(self, text):
        for line in text.split("\n"):
            match = re.match(YEAR_REGEX, line)
            if not match:
                continue
            return f"20{match.group(1)}"
        raise Exception("Year could not be extracted")

    def _get_pdf_entries(self, owner, filepath):
        entries = []
        timestamp = get_timestamp()

        entries = []
        reader = PdfReader(filepath)
        for page_number in range(len(reader.pages)):
            page = reader.pages[page_number]
            text = page.extract_text()
            if page_number == 0:
                year = self._extract_pdf_year(text)

            if "ACCOUNT ACTIVITY" not in text:
                continue

            for line in text.split("\n"):
                match = re.match(PDF_LINE_REGEX, line)
                if not match:
                    continue

                entries.append(
                    BudgetFileEntryDDBItem.from_pdf_row(
                        match.groups(), owner, year, timestamp
                    )
                )

        return entries

    def _handle_created(self, created):
        print(f"Handling: {created}")
        key = f"{UPLOADS_PREFIX}/{created}"
        owner = created.split("/")[1]

        scan_dict = {"owner": owner, "s3_key": created}
        records = self.aws.dynamodb.tables["budget_file"].scan(scan_dict=scan_dict)
        if len(records) == 0:
            raise Exception(f"No records found for {scan_dict}")
        elif len(records) > 1:
            raise Exception(f"Multiple records found for {scan_dict}")

        record = records[0]
        if record.state != FileState.UPLOADED:
            raise Exception(f"Cannot handle file in state: {record.state}")

        file_type = self.aws.s3.buckets["uploads"].head(key)["ContentType"]
        filepath = self.aws.s3.buckets["uploads"].download(key)
        print("Downloaded")

        if file_type == "text/csv":
            file_entries = self._get_csv_entries(owner, filepath, record.id)
        elif file_type == "application/pdf":
            file_entries = self._get_pdf_entries(owner, filepath, record.id)
        else:
            raise Exception(f"Unsupported filetype: {file_type}")

        print(f"{len(file_entries)} retrieved")
        ids = set()
        deduped_entries = []
        for entry in file_entries:
            if entry.id in ids:
                continue
            ids.add(entry.id)
            deduped_entries.append(entry)

        self.aws.dynamodb.tables["budget_file_entry"].bulk_put(deduped_entries)

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


# event = {'Records': [{'eventVersion': '2.1', 'eventSource': 'aws:s3', 'awsRegion': 'us-east-1', 'eventTime': '2024-12-24T21:24:29.234Z', 'eventName': 'ObjectCreated:Put', 'userIdentity': {'principalId': 'AWS:AIDAJDNB5MJJIJIUWHFYC'}, 'requestParameters': {'sourceIPAddress': '75.11.10.172'}, 'responseElements': {'x-amz-request-id': 'WH161H7AEN93KHRB', 'x-amz-id-2': 'pQXj5hE39T5SgdnG5mXt8cFnT9GVAorSPAg0ikfSBSNobJSCflKgm2bYZsSFNI0v8wiNrwanSPW9Zqujq4q8UdWDmrDNpPaa'}, 's3': {'s3SchemaVersion': '1.0', 'configurationId': 'tf-s3-lambda-20241224212403804500000002', 'bucket': {'name': 'aseaman-protected', 'ownerIdentity': {'principalId': 'A3QM71HR4ZP65N'}, 'arn': 'arn:aws:s3:::aseaman-protected'}, 'object': {'key': 'budget/uploads/local/andrew/ed519310e1004c648c23efb132b82002', 'size': 3307, 'eTag': '6f9743a310f39d815641a3392982e9cf', 'sequencer': '00676B268D0D3693BE'}}}]}
# lambda_handler(event, {})
