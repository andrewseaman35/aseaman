import csv
from dataclasses import dataclass
import datetime
import hashlib
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

YEAR_REGEX = r"^Payment Due Date: \d\d\/\d\d\/(\d\d)$"
LINE_REGEXEN = [
    r"^(\d+\/\d+)     (.* )(-?\d+.\d\d)$",  # current format
    r"^(\d+\/\d+)  (.* )(-?\d+.\d\d)$",  # ~2020 format
]


@dataclass
class FileState:
    UPLOADED = "uploaded"
    IMPORTED = "imported"
    PROCESSED = "processed"


@dataclass
class BudgetFileRow:
    TRANSACTION_TYPE_SALE = "Sale"
    TRANSACTION_TYPE_PAYMENT = "Payment"

    transaction_date: datetime.datetime
    post_date: str
    description: str
    category: str
    transaction_type: str
    amount: float

    @property
    def hash_(self):
        # Only include items that are actually present from both CSV and PDF extraction
        hash_items = [
            str(self.transaction_date.date()),
            self.description or "",
            str(self.amount),
        ]
        row_bytes = "|".join(hash_items).encode("utf-8")
        hash_object = hashlib.sha256(row_bytes)
        return hash_object.hexdigest()

    @classmethod
    def from_csv_row(cls, row):
        return cls(
            transaction_date=datetime.datetime.strptime(row[0], "%m/%d/%Y"),
            post_date=datetime.datetime.strptime(row[1], "%m/%d/%Y"),
            description=row[2],
            category=row[3],
            transaction_type=row[4],
            amount=float(row[5]),
        )

    @classmethod
    def from_pdf_row(cls, row, year):
        amount = float(row[2])
        transaction_date = datetime.datetime.strptime(f"{row[0]}/{year}", "%m/%d/%Y")
        transaction_type = (
            cls.TRANSACTION_TYPE_PAYMENT if amount < 0 else cls.TRANSACTION_TYPE_SALE
        )

        return cls(
            transaction_date=transaction_date,
            post_date=transaction_date,
            description=row[1],
            category=None,
            transaction_type=transaction_type,
            amount=amount,
        )


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

    def _get_csv_entries(self, owner, filepath, source):
        entries = []
        timestamp = get_timestamp()
        with open(filepath, newline="") as csvfile:
            reader = csv.reader(csvfile, delimiter=",", quotechar="|")
            next(reader, None)
            budget_file_rows = [BudgetFileRow.from_csv_row(row) for row in reader]

        entries = [
            BudgetFileEntryDDBItem.from_row(row, owner, timestamp, source)
            for row in budget_file_rows
        ]
        return entries

    def _extract_pdf_year(self, text):
        for line in text.split("\n"):
            match = re.match(YEAR_REGEX, line)
            if not match:
                continue
            return f"20{match.group(1)}"
        raise Exception("Year could not be extracted")

    def _get_pdf_entries(self, owner, filepath, source):
        timestamp = get_timestamp()

        budget_file_rows = []
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
                for line_regex in LINE_REGEXEN:
                    match = re.match(line_regex, line)
                    if not match:
                        continue
                    budget_file_rows.append(
                        BudgetFileRow.from_pdf_row(match.groups(), year)
                    )
                    break
        entries = [
            BudgetFileEntryDDBItem.from_row(row, owner, timestamp, source)
            for row in budget_file_rows
        ]

        return entries

    def _get_record(self, created):
        print(f"Retrieving record: {created}")
        key = f"{UPLOADS_PREFIX}/{created}"
        owner = created.split("/")[1]
        scan_dict = {"owner": owner, "s3_key": created}
        records = self.aws.dynamodb.tables["budget_file"].scan(scan_dict=scan_dict)
        if len(records) == 0:
            raise Exception(f"No records found for {scan_dict}")
        elif len(records) > 1:
            raise Exception(f"Multiple records found for {scan_dict}")
        return records[0]

    def _handle_created(self, record):
        print(f"Handling: {record.ddb_key}")
        key = f"{UPLOADS_PREFIX}/{record.s3_key}"
        if record.state != FileState.UPLOADED:
            raise Exception(f"Cannot handle file in state: {record.state}")

        file_type = self.aws.s3.buckets["uploads"].head(key)["ContentType"]
        filepath = self.aws.s3.buckets["uploads"].download(key)
        print("Downloaded")

        if file_type == "text/csv":
            file_entries = self._get_csv_entries(record.owner, filepath, record.id)
        elif file_type == "application/pdf":
            file_entries = self._get_pdf_entries(record.owner, filepath, record.id)
        else:
            raise Exception(f"Unsupported filetype: {file_type}")

        print(f"{len(file_entries)} retrieved")
        ids = set()
        duplicated_entry_count = 0
        deduped_entries = []
        for entry in file_entries:
            if entry.id in ids:
                duplicated_entry_count += 1
                continue
            ids.add(entry.id)
            deduped_entries.append(entry)

        print(f"Found {duplicated_entry_count} duplicates")

        self.aws.dynamodb.tables["budget_file_entry"].bulk_put(deduped_entries)
        print(f"{len(file_entries)} stored")

        update_dict = {
            "state": {
                "value": FileState.IMPORTED,
                "operation": "SET",
            },
        }
        self.aws.dynamodb.tables["budget_file"].update(
            key=record.ddb_key,
            update_dict=update_dict,
        )
        print(f"Budget file updated: {record.ddb_key}")

    def _run(self, changes):
        print(f"Processing {len(changes[CREATION_EVENT_NAME])} creation events")
        for created in changes[CREATION_EVENT_NAME]:
            try:
                record = self._get_record(created)
                self._handle_created(record)
            except Exception:
                update_dict = {
                    "state": {
                        "value": FileState.FAILED,
                        "operation": "SET",
                    },
                }
                self.aws.dynamodb.tables["budget_file"].update(
                    key=record.ddb_key,
                    update_dict=update_dict,
                )


def lambda_handler(event, context):
    return BudgetFileLambdaHandler(event, context).handle()


# event = {'Records': [{'eventVersion': '2.1', 'eventSource': 'aws:s3', 'awsRegion': 'us-east-1', 'eventTime': '2024-12-24T21:24:29.234Z', 'eventName': 'ObjectCreated:Put', 'userIdentity': {'principalId': 'AWS:AIDAJDNB5MJJIJIUWHFYC'}, 'requestParameters': {'sourceIPAddress': '75.11.10.172'}, 'responseElements': {'x-amz-request-id': 'WH161H7AEN93KHRB', 'x-amz-id-2': 'pQXj5hE39T5SgdnG5mXt8cFnT9GVAorSPAg0ikfSBSNobJSCflKgm2bYZsSFNI0v8wiNrwanSPW9Zqujq4q8UdWDmrDNpPaa'}, 's3': {'s3SchemaVersion': '1.0', 'configurationId': 'tf-s3-lambda-20241224212403804500000002', 'bucket': {'name': 'aseaman-protected', 'ownerIdentity': {'principalId': 'A3QM71HR4ZP65N'}, 'arn': 'arn:aws:s3:::aseaman-protected'}, 'object': {'key': 'budget/uploads/local/andrew/ed519310e1004c648c23efb132b82002', 'size': 3307, 'eTag': '6f9743a310f39d815641a3392982e9cf', 'sequencer': '00676B268D0D3693BE'}}}]}
# lambda_handler(event, {})
