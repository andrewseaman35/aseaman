import base64
import io
import json
import random
import string
import time

import qrcode

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
)
from base.helpers import (
    requires_authentication,
    requires_user_group,
)

LINK_ID_LENGTH = 6

DEFAULT_SORT = "+time_created"

DEFAULT_LINK_NAME = "untitled"
DEFAULT_LINK_URL = ""


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

    def _get_sort_params(self, sort_value):
        reverse = sort_value.startswith("-")
        sort_key = sort_value.strip("-").strip("+")
        return {
            "key": lambda x: x[sort_key].lower(),
            "reverse": reverse,
        }

    def _format_ddb_item(self, ddbItem):
        locked = False if "locked" not in ddbItem else ddbItem["locked"]["BOOL"]
        return {
            "id": ddbItem["id"]["S"],
            "url": ddbItem["url"]["S"],
            "active": ddbItem["active"]["BOOL"],
            "locked": locked,
            "name": ddbItem["name"]["S"],
            "time_created": ddbItem["time_created"]["N"],
            "time_updated": ddbItem["time_updated"]["N"],
        }

    def __validate_link_ownership(self, ddbItem):
        owner = ddbItem.get("owner", {}).get("S", None)
        if not self.user["username"] or self.user["username"] != owner:
            raise UnauthorizedException("Log in to access this link")

    def _build_link_item(self, url, name, active=False, locked=False):
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
            "locked": {
                "BOOL": locked,
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

    def _build_update_expression_parameters(
        self, url=None, name=None, active=None, locked=None
    ):
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
        if locked is not None:
            expression_items.append("#loc = :loc")
            attribute_names["#loc"] = "locked"
            attribute_values[":loc"] = {"BOOL": locked}

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

    # @requires_user_group('link-manager')
    def _generate_qr_code(self, link, direct=False):
        print(f"Generating QR code for {link['id']}")
        redirected_url = f"{self.site_url}/l#{link['id']}"
        url = link["url"] if direct else redirected_url

        qr_png = qrcode.make(url)
        with io.BytesIO() as output:
            qr_png.save(output)
            contents = base64.b64encode(output.getvalue())

        return contents.decode("utf-8")

    def _new_link(self, url, name, active=False):
        print("Creating new link")
        ddbItem = self._build_link_item(url, name, active)
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=ddbItem,
        )
        return self._format_ddb_item(ddbItem)

    def _update_link(self, link_id, url=None, name=None, active=None, locked=None):
        print(f"Updating link {link_id}")
        (
            update_expression,
            expression_attribute_names,
            expression_attribute_values,
        ) = self._build_update_expression_parameters(url, name, active, locked)
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
        path_parts = self.event["path"].strip("/").split("/")
        resource = path_parts[1] if len(path_parts) > 1 else None

        response = self._empty_response()

        link_id = self.params.get("id")
        if resource == "qr":
            result = self.handle_generate_qr(link_id)
            response["headers"]["Content-Type"] = "image/png"
            response["isBase64Encoded"] = True
        else:
            if link_id:
                result = self.__fetch_link(
                    link_id, validate_ownership=False, require_active=True
                )
            else:
                result = self.handle_get_all_owned_links()

        return {
            **response,
            "body": json.dumps(result),
        }

    @requires_user_group("link-manager")
    def handle_generate_qr(self, link_id):
        link = self.__fetch_link(link_id)
        return self._generate_qr_code(link, direct=False)

    @requires_authentication
    def handle_get_all_owned_links(self):
        sort_value = self.params.get("sort", DEFAULT_SORT)
        print(f"sort value: {sort_value}")
        result = self.__fetch_links_by_owner(self.user["username"])
        return sorted(
            result,
            **self._get_sort_params(sort_value),
        )

    @requires_user_group("link-manager")
    def handle_post(self):
        url = self.params.get("url", DEFAULT_LINK_URL)
        name = self.params.get("name", DEFAULT_LINK_NAME)

        result = self._new_link(url, name)

        return {**self._empty_response(), "body": json.dumps(result)}

    @requires_user_group("link-manager")
    def handle_put(self):
        link_id = self.params.get("id")
        if not link_id:
            raise BadRequestException("id required")

        link = self.__fetch_link(link_id)
        if link["locked"]:
            raise ForbiddenException("cannot update locked link")

        result = self._update_link(
            link_id,
            url=self.params.get("url"),
            name=self.params.get("name"),
            active=self.params.get("active"),
            locked=self.params.get("locked"),
        )

        return {**self._empty_response(), "body": json.dumps(result)}

    @requires_user_group("link-manager")
    def handle_delete(self):
        link_id = self.params.get("id")
        if not link_id:
            raise BadRequestException("id required")

        link = self.__fetch_link(link_id)
        if link["locked"]:
            raise ForbiddenException("cannot delete locked link")

        self._delete_link(link_id)

        return {**self._empty_response(), "body": json.dumps({})}


def lambda_handler(event, context):
    return LinkerLambdaHandler(event, context).handle()
