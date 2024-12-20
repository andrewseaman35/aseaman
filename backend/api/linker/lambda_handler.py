import base64
import io
import json
import random
import string
import time

import qrcode
import qrcode.image.svg

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
)
from base.dynamodb import DynamoDBItem, DynamoDBItemValueConfig
from base.helpers import (
    requires_authentication,
    requires_user_group,
    get_timestamp,
    generate_alphanumeric_id,
)

LINK_ID_LENGTH = 6

DEFAULT_SORT = "+time_created"

DEFAULT_LINK_NAME = "untitled"
DEFAULT_LINK_URL = ""


class LinkDDBItem(DynamoDBItem):
    _config = {
        "id": DynamoDBItemValueConfig(
            "S", lambda: generate_alphanumeric_id(LINK_ID_LENGTH)
        ),
        "url": DynamoDBItemValueConfig("S", ""),
        "active": DynamoDBItemValueConfig("BOOL", False),
        "locked": DynamoDBItemValueConfig("BOOL", False),
        "time_created": DynamoDBItemValueConfig("N", get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", None),
    }


class LinkerLambdaHandler(APILambdaHandlerBase):
    @property
    def table_name(self):
        if self.env == "live":
            return "linker"
        return f"linker_{self.env}"

    def _init_aws(self):
        self.ddb_client = self.aws_session.client("dynamodb", region_name="us-east-1")

    def _get_sort_params(self, sort_value):
        reverse = sort_value.startswith("-")
        sort_key = sort_value.strip("-").strip("+")
        return {
            "key": lambda x: x[sort_key].lower(),
            "reverse": reverse,
        }

    def __validate_link_ownership(self, link):
        owner = link["owner"]
        if not self.user["username"] or self.user["username"] != owner:
            raise UnauthorizedException("Log in to access this link")

    def _build_update_expression_parameters(
        self, url=None, name=None, active=None, locked=None
    ):
        expression_items = ["SET #tu = :tu"]
        attribute_names = {
            "#tu": "time_updated",
        }
        attribute_values = {":tu": {"N": get_timestamp()}}
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
        ddb_item = self.ddb_client.get_item(
            TableName=self.table_name,
            Key={
                "id": {
                    "S": link_id,
                },
            },
        )
        if "Item" not in ddb_item:
            raise NotFoundException("Link not found")

        raw_item = ddb_item["Item"]
        link = LinkDDBItem.from_ddb_item(raw_item)

        if validate_ownership:
            self.__validate_link_ownership(link)
        if require_active and not link["active"]:
            raise NotFoundException("Link not found")

        return link

    def __fetch_links_by_owner(self, owner):
        raw_items = self.ddb_client.scan(
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

        return [LinkDDBItem.from_ddb_item(item) for item in raw_items]

    # @requires_user_group('link-manager')
    def _generate_qr_code(self, link, direct=False, svg=False):
        print(f"Generating QR code for {link['id']}")
        redirected_url = f"{self.site_url}/l#{link['id']}"
        url = link["url"] if direct else redirected_url

        if svg:
            factory = qrcode.image.svg.SvgImage
            qr_img = qrcode.make(url, image_factory=factory)
        else:
            qr_img = qrcode.make(url)

        with io.BytesIO() as output:
            qr_img.save(output)
            contents = base64.b64encode(output.getvalue())

        return contents.decode("utf-8")

    def _new_link(self, url, name, active=False):
        print("Creating new link")
        timestamp = get_timestamp()
        link = LinkDDBItem.from_dict(
            {
                "url": "url",
                "name": "name",
                "active": active,
                "time_created": timestamp,
                "time_updated": timestamp,
            }
        )

        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=link.to_ddb_item(),
        )
        return link.to_dict()

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
        return LinkDDBItem.from_ddb_item(ddbItem).to_dict()

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
                ).to_dict()
            else:
                result = [link.to_dict() for link in self.handle_get_all_owned_links()]

        return {
            **response,
            "body": json.dumps(result),
        }

    @requires_user_group("link-manager")
    def handle_generate_qr(self, link_id):
        link = self.__fetch_link(link_id).to_dict()
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

        link = self.__fetch_link(link_id).to_dict()
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

        link = self.__fetch_link(link_id).to_dict()
        if link["locked"]:
            raise ForbiddenException("cannot delete locked link")

        self._delete_link(link_id)

        return {**self._empty_response(), "body": json.dumps({})}


def lambda_handler(event, context):
    return LinkerLambdaHandler(event, context).handle()
