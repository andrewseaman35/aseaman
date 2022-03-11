import enum
import json
import random
import re
import string
import time

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
)

LINK_ID_LENGTH = 6


class LinkerStatus(enum.Enum):
    ACTIVE = "A"
    INACTIVE = "I"
    DELETED = "X"


class LinkerLambdaHandler(APILambdaHandlerBase):
    @property
    def table_name(self):
        if self.env == "live":
            return "linker"
        return f"linker_{self.env}"

    def _init_aws(self):
        self.ddb_client = self.aws_session.client("dynamodb", region_name="us-east-1")

    def _new_link_id(self):
        return "".join(
            random.choices(
                string.ascii_lowercase + string.ascii_uppercase + string.digits,
                k=LINK_ID_LENGTH,
            )
        )

    def _get_timestamp(self):
        return str(int(time.time()))

    def _format_ddb_item(self, ddbItem):
        return {
            "id": ddbItem["id"]["S"],
            "url": ddbItem["url"]["S"],
            "status": ddbItem["status"]["S"],
            "time_created": ddbItem["time_created"]["N"],
            "time_updated": ddbItem["time_updated"]["N"],
        }

    def __validate_link_ownership(self, ddbItem):
        owner = ddbItem.get("owner", {}).get("S", None)
        if not self.user["username"] or self.user["username"] != owner:
            raise UnauthorizedException("Log in to access this link")

    def _build_link_item(self, url):
        timestamp = self._get_timestamp()
        item = {
            "id": {
                "S": self._new_link_id(),
            },
            "url": {
                "S": url,
            },
            "status": {
                "S": LinkerStatus.INACTIVE,
            },
            "owner": {
                "S": self.user["username"],
            },
            "time_created": {
                "N": timestamp,
            },
            "time_updated": {
                "N": timestamp,
            },
        }

        return item

    def __fetch_link(self, link_id):
        ddbItem = self.ddb_client.get_item(
            TableName=self.table_name,
            Key={
                "id": {
                    "S": link_id,
                },
            },
        )
        if "Item" not in ddbItem:
            raise NotFoundException("Link not found")

        ddbItem = ddbItem["Item"]

        return self._format_ddb_item(ddbItem)

    def _new_link(self, url, status=None):
        print("Creating new link")
        ddbItem = self._build_link_item(url, status)
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=ddbItem,
        )
        return self._format_ddb_item(ddbItem)

    def handle_get(self):
        link_id = self.params.get("id")
        if link_id:
            result = self.__fetch_link(link_id)

        return {
            **self._empty_response(),
            "body": json.dumps(result),
        }

    def handle_post(self):
        url = self.params.get("url")
        if not url:
            raise BadRequestException("url required")

        result = self._new_link(url)

        return {**self._empty_response(), "body": json.dumps(result)}


def lambda_handler(event, context):
    return LinkerLambdaHandler(event, context).handle()
