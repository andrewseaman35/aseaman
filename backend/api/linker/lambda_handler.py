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

DEFAULT_NAME = "untitled"


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
            "active": ddbItem["active"]["BOOL"],
            "name": ddbItem["name"]["S"],
            "time_created": ddbItem["time_created"]["N"],
            "time_updated": ddbItem["time_updated"]["N"],
        }

    def __validate_link_ownership(self, ddbItem):
        owner = ddbItem.get("owner", {}).get("S", None)
        if not self.user["username"] or self.user["username"] != owner:
            raise UnauthorizedException("Log in to access this link")

    def _build_link_item(self, url, name, active=False):
        timestamp = self._get_timestamp()
        item = {
            "id": {
                "S": self._new_link_id(),
            },
            "url": {
                "S": url,
            },
            "name": {
                "S": name,
            },
            "active": {
                "BOOL": active,
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

    def _build_update_expression_parameters(self, url=None, name=None, active=None):
        expression_items = ["SET #tu = :tu"]
        attribute_names = {
            "#tu": "time_updated",
        }
        attribute_values = {":tu": {"N": self._get_timestamp()}}
        if url is not None:
            expression_items.append("#url = :url")
            attribute_names["#url"] = "url"
            attribute_values[":url"] = {"S": url}
        if name is not None:
            expression_items.append("#na = :na")
            attribute_names["#na"] = "name"
            attribute_values[":na"] = {"S": name}
        if active is not None:
            expression_items.append("#act = :act")
            attribute_names["#act"] = "active"
            attribute_values[":act"] = {"BOOL": active}

        return (
            ", ".join(expression_items),
            attribute_names,
            attribute_values,
        )

    def __fetch_link(self, link_id, validate_ownership=True, require_active=False):
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

        if validate_ownership:
            self.__validate_link_ownership(ddbItem)
        if require_active and not ddbItem["active"]["BOOL"]:
            raise NotFoundException("Link not found")

        return self._format_ddb_item(ddbItem)

    def __fetch_links_by_owner(self, owner):
        ddbItems = self.ddb_client.scan(
            TableName=self.table_name,
            ExpressionAttributeNames={
                "#own": "owner",
            },
            ExpressionAttributeValues={
                ":own": {
                    "S": owner,
                },
            },
            FilterExpression="(#own = :own)",
        )["Items"]

        return [self._format_ddb_item(ddbItem) for ddbItem in ddbItems]

    def _new_link(self, url, name, active=False):
        print("Creating new link")
        ddbItem = self._build_link_item(url, name, active)
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=ddbItem,
        )
        return self._format_ddb_item(ddbItem)

    def _update_link(self, link_id, url=None, name=None, active=None):
        print(f"Updating link {link_id}")
        (
            update_expression,
            expression_attribute_names,
            expression_attribute_values,
        ) = self._build_update_expression_parameters(url, name, active)
        ddbItem = self.ddb_client.update_item(
            TableName=self.table_name,
            Key={"id": {"S": link_id}},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW",
        )["Attributes"]
        return self._format_ddb_item(ddbItem)

    def _delete_link(self, link_id):
        print(f"Deleting link {link_id}")
        self.ddb_client.delete_item(
            TableName=self.table_name,
            Key={
                "id": {"S": link_id},
            },
        )

    def handle_get(self):
        link_id = self.params.get("id")
        if link_id:
            result = self.__fetch_link(
                link_id, validate_ownership=False, require_active=True
            )
        else:
            if not self.user["username"]:
                raise PermissionError("no logged in user")
            result = self.__fetch_links_by_owner(self.user["username"])

        return {
            **self._empty_response(),
            "body": json.dumps(result),
        }

    def handle_post(self):
        url = self.params.get("url")
        name = self.params.get("name", DEFAULT_NAME)
        if not url:
            raise BadRequestException("url required")

        result = self._new_link(url, name)

        return {**self._empty_response(), "body": json.dumps(result)}

    def handle_put(self):
        link_id = self.params.get("id")
        if not link_id:
            raise BadRequestException("id required")

        self.__fetch_link(link_id)

        result = self._update_link(
            link_id,
            url=self.params.get("url"),
            name=self.params.get("name"),
            active=self.params.get("active"),
        )

        return {**self._empty_response(), "body": json.dumps(result)}

    def handle_delete(self):
        link_id = self.params.get("id")
        if not link_id:
            raise BadRequestException("id required")

        self.__fetch_link(link_id)
        self._delete_link(link_id)

        return {**self._empty_response(), "body": json.dumps({})}


def lambda_handler(event, context):
    return LinkerLambdaHandler(event, context).handle()
