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
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
)
from base.dynamodb import DynamoDBItem, DynamoDBItemValueConfig, DynamoDBTable
from base.helpers import (
    requires_authentication,
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
    PROCESSED = "processed"


class BudgetFileDDBItem(DynamoDBItem):
    _config = {
        "owner": DynamoDBItemValueConfig("S"),
        "id": DynamoDBItemValueConfig("S", default=generate_id),
        "state": DynamoDBItemValueConfig("S"),
        "s3_key": DynamoDBItemValueConfig("S", internal=True),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None),
    }

    @classmethod
    def build_ddb_key(cls, *args, id=None, **kwargs):
        assert id is not None, "id required to build ddb key"
        return {
            "id": {
                "S": id,
            }
        }

    def validate_ownership(self, user=None):
        if user is None:
            raise UnauthorizedException("not logged in")

        owner_username = self.owner
        if not user["username"] or user["username"] != owner_username:
            raise UnauthorizedException("Budget file not owned")


class BudgetFileTable(DynamoDBTable):
    ItemClass = BudgetFileDDBItem


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
                file_bytes=self.params["budget-file"],
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
