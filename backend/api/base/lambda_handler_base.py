import datetime
import json
import os
import traceback

import boto3

from .api_exceptions import (
    APIException,
    BadRequestException,
    UnauthorizedException,
    BaseAPIException,
    MethodNotAllowedException,
)


SSM_API_KEY = "lambda-api-key"

EMPTY_RESPONSE = {
    "isBase64Encoded": False,
    "statusCode": 200,
    "headers": {"Access-Control-Allow-Origin": "*"},
    "multiValueHeaders": {},
    "body": json.dumps({}),
}


class APILambdaHandlerBase(object):
    require_auth = True
    rest_enabled = True

    def __init__(self, event, context):
        self.event = event
        self.context = context
        self.api_key = None
        self.handlers_by_method = {
            "GET": self.handle_get,
            "POST": self.handle_post,
            "DELETE": self.handle_delete,
        }

    def __init_aws(self):
        self.aws_session = (
            boto3.session.Session(profile_name="aseaman")
            if self.is_local
            else boto3.session.Session()
        )
        self.ssm_client = self.aws_session.client("ssm", region_name="us-east-1")
        self._init_aws()

    def _init(self):
        pass

    def _init_aws(self):
        pass

    @property
    def is_local(self):
        return os.environ.get("IN_DOCKER_API") == "true"

    @property
    def __api_key(self):
        response = self.ssm_client.get_parameter(Name=SSM_API_KEY)
        value = response["Parameter"]["Value"]
        return value

    @classmethod
    def _ddb_item_to_json(cls, ddb_item):
        item_data = {}
        for key, value_type_map in ddb_item.items():
            value = cls._parse_ddb_value_type_map(value_type_map)
            item_data[key] = value
        return item_data

    @classmethod
    def _parse_ddb_value_type_map(cls, value_type_map):
        value_type = next(iter(value_type_map.keys()))
        value = value_type_map[value_type]
        if value_type == "S":
            return str(value)
        elif value_type == "N":
            return int(value)
        elif value_type == "BOOL":
            return value
        elif value_type == "L":
            return [cls._parse_ddb_value_type_map(val) for val in value]
        elif value_type == "M":
            return {
                key: cls._parse_ddb_value_type_map(val) for (key, val) in value.items()
            }
        else:
            raise BadRequestException("unsupported value: {}".format(value_type))

    def __parse_event(self, event):
        print(" -- Received event --")
        print(json.dumps(event, indent=4))
        print(" --                --")

        params = {}
        if self.event["httpMethod"] in {"GET", "DELETE"}:
            params = self.event["queryStringParameters"] or {}
            params.update(self.event["multiValueQueryStringParameters"] or {})
        elif self.event["httpMethod"] == "POST":
            params = json.loads(self.event["body"])
        self.params = params

    def _validate_auth(self):
        api_key = self.params.get("api_key")
        if not self.__api_key or not api_key == self.__api_key:
            raise UnauthorizedException("invalid api key")

    def __before_run(self):
        self._init()
        self.__init_aws()
        self.__parse_event(self.event)

    def _empty_response(self):
        return {**EMPTY_RESPONSE}

    def handle_get(self):
        raise MethodNotAllowedException("GET not supported")

    def handle_post(self):
        raise MethodNotAllowedException("POST not supported")

    def handle_delete(self):
        raise MethodNotAllowedException("DELETE not supported")

    def handle(self):
        print(self.event)

        response = {**EMPTY_RESPONSE}
        try:
            self.__before_run()
            handler = self.handlers_by_method.get(self.event.get("httpMethod"), None)
            if handler:
                response = handler()
            else:
                raise MethodNotAllowedException("method not supported")
        except BaseAPIException as e:
            self._handle_api_error(e)
            response = e.to_json_response()
        except Exception as e:
            self._handle_error(e)
            response = APIException().to_json_response()

        return response

    def _handle_api_error(self, e):
        print("API error!")
        print("API error: {}".format(e))
        traceback.print_exc()

    def _handle_error(self, e):
        print("Uh oh, error!")
        print("error: {}".format(e))
        traceback.print_exc()
