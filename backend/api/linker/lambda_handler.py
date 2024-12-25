import base64
import io
import json

import qrcode
import qrcode.image.svg

from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import AWSConfig, DynamoDBConfig, DynamoDBTableConfig
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    UnauthorizedException,
)
from base.dynamodb import LinkDDBItem, LinkTable, DynamoDBUnauthorizedException
from base.helpers import (
    requires_authentication,
    requires_user_group,
    get_timestamp,
    UserGroup,
)

DEFAULT_SORT = "+time_created"

DEFAULT_LINK_NAME = "untitled"
DEFAULT_LINK_URL = ""


class LinkerLambdaHandler(APILambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig("linker", LinkTable),
            ],
        )
    )

    def _get_sort_params(self, sort_value):
        reverse = sort_value.startswith("-")
        sort_key = sort_value.strip("-").strip("+")
        return {
            "key": lambda x: x[sort_key].lower(),
            "reverse": reverse,
        }

    def __fetch_link(self, link_id, validate_ownership=True, require_active=False):
        link = self.aws.dynamodb.tables["linker"].get(id=link_id)

        if validate_ownership:
            try:
                link.validate_ownership(self.user)
            except DynamoDBUnauthorizedException:
                raise UnauthorizedException
        if require_active and not link["active"]:
            raise NotFoundException("Link not found")

        return link

    def __fetch_links_by_owner(self, owner):
        return self.aws.dynamodb.tables["linker"].scan({"owner": owner})

    @requires_user_group(UserGroup.LINK_MANAGER)
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

        self.aws.dynamodb.tables["linker"].put(link)

        return link.to_dict()

    def _update_link(self, link_id, url=None, name=None, active=None, locked=None):
        print(f"Updating link {link_id}")
        update_dict = {
            "url": {"value": url, "operation": "SET"},
            "name": {"value": name, "operation": "SET"},
            "active": {"value": active, "operation": "SET"},
            "locked": {"value": locked, "operation": "SET"},
        }

        link = self.aws.dynamodb.tables["linker"].update(
            LinkDDBItem.build_ddb_key(id=link_id), update_dict
        )
        return link.to_dict()

    def _delete_link(self, link_id):
        print(f"Deleting link {link_id}")
        self.aws.dynamodb.tables["linker"].delete(LinkDDBItem.build_ddb_key(id=link_id))

    def handle_get(self):
        resource = self.get_resource()

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

    @requires_user_group(UserGroup.LINK_MANAGER)
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

    @requires_user_group(UserGroup.LINK_MANAGER)
    def handle_post(self):
        url = self.params.get("url", DEFAULT_LINK_URL)
        name = self.params.get("name", DEFAULT_LINK_NAME)

        result = self._new_link(url, name)

        return {**self._empty_response(), "body": json.dumps(result)}

    @requires_user_group(UserGroup.LINK_MANAGER)
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

    @requires_user_group(UserGroup.LINK_MANAGER)
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
