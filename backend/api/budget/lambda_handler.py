from dataclasses import dataclass
import json
import os
import sys

# Required to support absolute imports when running locally and on lambda
CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)

from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import (
    AWSConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
    S3Config,
    S3BucketConfig,
)
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
    UnsupportedMediaTypeException,
)
from base.dynamodb import (
    BudgetFileDDBItem,
    BudgetFileTable,
    BudgetFileEntryTable,
    BudgetFileConfigDDBItem,
    BudgetFileConfigTable,
)
from base.helpers import (
    requires_user_group,
    get_timestamp,
    generate_id,
    UserGroup,
)
from budget_summary import BudgetConfig, BudgetSummary


ACCEPTED_CONTENT_TYPES = {
    "application/pdf",
    "text/csv",
}


@dataclass
class FileState:
    UPLOADED = "uploaded"
    IMPORTED = "imported"
    PROCESSED = "processed"


class BudgetLambdaHandler(APILambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig("budget_file", BudgetFileTable),
                DynamoDBTableConfig("budget_file_entry", BudgetFileEntryTable),
                DynamoDBTableConfig("budget_file_config", BudgetFileConfigTable),
            ],
        ),
        s3=S3Config(
            enabled=True,
            buckets=[
                S3BucketConfig("uploads", "aseaman-protected", "budget/uploads"),
                S3BucketConfig("config", "aseaman-protected", "budget/config"),
            ],
        ),
    )

    def load_config(self, refresh=False):
        config_record = self.aws.dynamodb.tables["budget_file_config"].get(
            owner=self.user["username"],
            quiet=True,
        )
        if config_record is None:
            return config_record

        config_file = self.aws.s3.buckets["config"].download(
            config_record.s3_key,
            include_prefix=True,
        )
        with open(config_file, "r") as f:
            config_data = json.loads(f.read())

        return BudgetConfig(config_data)

    def load_summary(self, year=None, month=None, config=None):
        if config is None:
            raise ValueError("config required")

        query_params = {}
        if year is not None:
            query_params["transaction_year"] = year
        if month is not None:
            query_params["transaction_month"] = month
        transactions = self.aws.dynamodb.tables["budget_file_entry"].query(
            {"owner": self.user["username"]}, query_params
        )
        return BudgetSummary(transactions, config)

    @requires_user_group(UserGroup.BUDGET)
    def handle_get(self):
        resource = self.get_resource()

        if resource == "entry":
            query_params = self.get_query_params(
                {"transaction_month", "transaction_year"}
            )
            key_dict = {
                "owner": self.user["username"],
            }
            entries = self.aws.dynamodb.tables["budget_file_entry"].query(
                key_dict, query_params
            )
            return {
                **self._empty_response(),
                "body": json.dumps({"entries": [entry.to_dict() for entry in entries]}),
            }
        elif resource == "config":
            config = self.load_config()
            if config is None:
                raise NotFoundException("config file not found")

            return {
                **self._empty_response(),
                "body": config.serialize(),
            }
        elif resource == "summary":
            query_params = self.get_query_params(
                {"transaction_month", "transaction_year"}
            )
            month = query_params.get("transaction_month")
            year = query_params.get("transaction_year")
            if not (month or year):
                raise BadRequestException(
                    "transaction_month or transaction_year required"
                )

            config = self.load_config()
            if config is None:
                raise BadRequestException("Config does not exist for user")

            summary = self.load_summary(year=year, month=month, config=config)

            return {
                **self._empty_response(),
                "body": summary.serialize(),
            }
        else:
            raise NotFoundException("unsupported resource: {}".format(resource))

    @requires_user_group(UserGroup.BUDGET)
    def handle_post(self):
        resource = self.get_resource()

        if resource == "file":
            headers = self.get_headers()
            timestamp = get_timestamp()
            filename = generate_id()
            content_type = headers["content-type"]
            if content_type not in ACCEPTED_CONTENT_TYPES:
                raise UnsupportedMediaTypeException(f"unsupported {content_type}")

            key = self.aws.s3.buckets["uploads"].put(
                file_bytes=self.params["body"],
                filename=f"{self.env}/{self.user['username']}/{filename}",
                content_type=content_type,
            )
            budget_file = BudgetFileDDBItem.from_dict(
                {
                    "owner": self.user["username"],
                    "state": FileState.UPLOADED,
                    "s3_key": key,
                    "time_created": timestamp,
                    "time_updated": timestamp,
                }
            )
            self.aws.dynamodb.tables["budget_file"].put(budget_file)
        elif resource == "config":
            timestamp = get_timestamp()
            filename = generate_id()
            s3_key = f"{self.env}/{filename}"
            key = self.aws.s3.buckets["config"].put(
                # file_bytes=self.params["body"],
                file_bytes=json.dumps(self.params),
                filename=s3_key,
                content_type="text/json",
            )
            config = BudgetFileConfigDDBItem.from_dict(
                {
                    "owner": self.user["username"],
                    "s3_key": s3_key,
                }
            )
            self.aws.dynamodb.tables["budget_file_config"].put(config)
            return {**self._empty_response()}
        else:
            raise NotFoundException("unsupported resource: {}".format(resource))

        return {**self._empty_response(), "body": budget_file.serialize()}


def lambda_handler(event, context):
    return BudgetLambdaHandler(event, context).handle()
