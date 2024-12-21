import base64
import io
import json

import qrcode
import qrcode.image.svg

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
)
from base.dynamodb import DynamoDBItem, DynamoDBItemValueConfig, DynamoDBTable
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
            "S", default=lambda: generate_alphanumeric_id(LINK_ID_LENGTH)
        ),
        "url": DynamoDBItemValueConfig("S", default=None),
        "active": DynamoDBItemValueConfig("BOOL", default=False),
        "locked": DynamoDBItemValueConfig("BOOL", default=False),
        "owner": DynamoDBItemValueConfig("S"),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None),
    }

    @classmethod
    def build_ddb_key(cls, *args, id=None):
        assert id is not None, "id required to build ddb key"
        return {
            "id": {
                "S": id,
            }
        }


class LinkTable(DynamoDBTable):
    ItemClass = LinkDDBItem


class LinkerLambdaHandler(APILambdaHandlerBase):
    aws_config = {
        "dynamodb": {
            "enabled": True,
            "tables": [("linker", LinkTable)],
        }
    }

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

    def __fetch_link(self, link_id, validate_ownership=True, require_active=False):
        link = self.aws["dynamodb"]["tables"]["linker"].get(id=link_id)

        if validate_ownership:
            self.__validate_link_ownership(link)
        if require_active and not link["active"]:
            raise NotFoundException("Link not found")

        return link

    def __fetch_links_by_owner(self, owner):
        return self.aws["dynamodb"]["tables"]["linker"].scan({"owner": owner})

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
                "url": url,
                "name": name,
                "active": active,
                "time_created": timestamp,
                "time_updated": timestamp,
                "owner": self.user["username"],
            }
        )

        self.aws["dynamodb"]["tables"]["linker"].put(link)

        return link.to_dict()

    def _update_link(self, link_id, url=None, name=None, active=None, locked=None):
        print(f"Updating link {link_id}")
        update_dict = {
            "url": url,
            "name": name,
            "active": active,
            "locked": locked,
        }

        link = self.aws["dynamodb"]["tables"]["linker"].update(
            LinkDDBItem.build_ddb_key(id=link_id), update_dict
        )
        return link.to_dict()

    def _delete_link(self, link_id):
        print(f"Deleting link {link_id}")
        self.aws["dynamodb"]["tables"]["linker"].delete(
            LinkDDBItem.build_ddb_key(id=link_id)
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
