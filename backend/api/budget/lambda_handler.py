import base64
from dataclasses import dataclass
import io
import json

import qrcode
import qrcode.image.svg

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
)
from base.helpers import (
    requires_user_group,
    get_timestamp,
    generate_id,
    UserGroup,
)

LINK_ID_LENGTH = 6

DEFAULT_SORT = "+time_created"

DEFAULT_LINK_NAME = "untitled"
DEFAULT_LINK_URL = ""


@dataclass
class FileState:
    UPLOADED = "uploaded"
    IMPORTED = "imported"
    PROCESSED = "processed"


class BudgetLambdaHandler(APILambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True, tables=[DynamoDBTableConfig("budget_file", BudgetFileTable)]
        ),
        s3=S3Config(
            enabled=True,
            buckets=[
                S3BucketConfig("uploads", "aseaman-protected", "budget/uploads"),
            ],
        ),
    )

    @requires_user_group(UserGroup.BUDGET)
    def handle_post(self):
        path_parts = self.event["path"].strip("/").split("/")
        resource = path_parts[1] if len(path_parts) > 1 else None

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
