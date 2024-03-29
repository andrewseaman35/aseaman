import copy
import datetime
import json
import os
import traceback

import boto3

from .api_exceptions import (
    APIException,
    BadRequestException,
    BaseAPIException,
    MethodNotAllowedException,
)
from .token_decoder import decode_token


EMPTY_RESPONSE = {
    "isBase64Encoded": False,
    "statusCode": 200,
    "headers": {"Access-Control-Allow-Origin": "*"},
    "multiValueHeaders": {},
    "body": json.dumps({}),
}


class APILambdaHandlerBase(object):
    rest_enabled = True
    region = "us-east-1"

    def __init__(self, event, context):
        self.event = event
        self.context = context
        self.env = os.environ.get("ENV")
        self.hostname = os.environ.get("HOSTNAME")
        self.site_url = f"http{'' if self.env == 'local' else 's'}://{self.hostname}"
        self.user = {
            "username": None,
            "groups": None,
        }
        self.handlers_by_method = {
            "GET": self.handle_get,
            "POST": self.handle_post,
            "PUT": self.handle_put,
            "DELETE": self.handle_delete,
        }

    def __init_aws(self):
        self.aws_session = (
            boto3.session.Session(profile_name="aseaman")
            if self.is_local
            else boto3.session.Session()
        )
        self.ssm_client = self.aws_session.client("ssm", region_name=self.region)
        self._init_aws()

    def _init(self):
        pass

    def _init_aws(self):
        pass

    @property
    def is_local(self):
        return os.environ.get("IN_DOCKER_API") == "true"

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

    @property
    def user_pool_id_ssm_key(self):
        env = "stage" if self.env == "local" else self.env
        return f"/aseaman/{env}/cognito/user_pool_id"

    @property
    def user_pool_client_id_ssm_key(self):
        env = "stage" if self.env == "local" else self.env
        return f"/aseaman/{env}/cognito/user_pool_client_id"

    def get_from_ssm(self, key):
        response = self.ssm_client.get_parameter(Name=key)
        return response["Parameter"]["Value"]

    def __parse_event(self, event):
        print(" -- Received event --")
        # print(json.dumps(event, indent=4))
        print(" --                --")

        params = {}
        if self.event["httpMethod"] in {"GET", "DELETE"}:
            params = self.event["multiValueQueryStringParameters"] or {}
            params.update(self.event["queryStringParameters"] or {})
        elif self.event["httpMethod"] in {"POST", "PUT"}:
            params = json.loads(self.event["body"])
        self.params = params

    def __decode_token(self):
        authorization = self.event["headers"].get("Authorization")
        if not authorization:
            return

        try:
            decoded = decode_token(
                authorization,
                self.region,
                self.get_from_ssm(self.user_pool_id_ssm_key),
                self.get_from_ssm(self.user_pool_client_id_ssm_key),
            )
        except Exception as e:
            print(f"Error encountered during token decoding: {e}")
            return

        if not decoded:
            print("! Invalid token !")
            return

        if decoded["exp"] <= datetime.datetime.now().timestamp():
            print("! Token expired !")
            return

        self.user["username"] = decoded["cognito:username"]
        self.user["groups"] = decoded.get("cognito:groups", [])

    def __before_run(self):
        self._init()
        self.__init_aws()
        self.__decode_token()
        self.__parse_event(self.event)

    def _empty_response(self):
        return copy.deepcopy(EMPTY_RESPONSE)

    def handle_get(self):
        raise MethodNotAllowedException("GET not supported")

    def handle_post(self):
        raise MethodNotAllowedException("POST not supported")

    def handle_put(self):
        raise MethodNotAllowedException("PUT not supported")

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
