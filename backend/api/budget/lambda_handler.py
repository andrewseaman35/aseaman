from dataclasses import dataclass
import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import (
    AWSConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
    S3Config,
    S3BucketConfig,
)
from base.api_exceptions import (
    NotFoundException,
)
from base.dynamodb import (
    BudgetFileDDBItem,
    BudgetFileTable,
    BudgetFileEntryTable,
)
from base.helpers import (
    requires_user_group,
    get_timestamp,
    generate_id,
    UserGroup,
)


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

    @requires_user_group(UserGroup.BUDGET)
    def handle_get(self):
        resource = self.get_resource()

        if resource == "entry":
            query_params = {
                k: v
                for k, v in self.params.items()
                if k in {"transaction_month", "transaction_year"}
            }
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
            config_key = f"{self.env}/{self.user['username']}"
            config_file_name = self.aws.s3.buckets["config"].download(
                key=config_key,
                include_prefix=True,
            )
            config = json.load(open(config_file_name, "r"))
            return {
                **self._empty_response(),
                "body": json.dumps(config),
            }
        else:
            raise NotFoundException("unsupported resource: {}".format(resource))

    @requires_user_group(UserGroup.BUDGET)
    def handle_post(self):
        resource = self.get_resource()

        if resource == "file":
            timestamp = get_timestamp()
            filename = generate_id()

            key = self.aws.s3.buckets["uploads"].put(
                file_bytes=self.params["body"],
                filename=f"{self.env}/{self.user['username']}/{filename}",
                content_type="text/csv",
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
        else:
            raise NotFoundException("unsupported resource: {}".format(resource))

        return {**self._empty_response(), "body": budget_file.serialize()}


def lambda_handler(event, context):
    return BudgetLambdaHandler(event, context).handle()
