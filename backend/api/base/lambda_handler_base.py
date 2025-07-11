import copy
import datetime
import json
import os
import traceback
from typing import Any, Callable

import boto3

from .api_exceptions import (
    APIException,
    BaseAPIException,
    MethodNotAllowedException,
)
from .token_decoder import decode_token
from .aws import AWSConfig, DynamoDBConfig, S3Config, SSMConfig, AWS, DynamoDB, SSM, S3
from .s3 import S3Bucket


EMPTY_RESPONSE: dict[str, Any] = {
    "isBase64Encoded": False,
    "statusCode": 200,
    "headers": {"Access-Control-Allow-Origin": "*"},
    "multiValueHeaders": {},
    "body": json.dumps({}),
}


class LambdaHandlerBase(object):
    region = "us-east-1"
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(enabled=False),
        s3=S3Config(enabled=False),
        ssm=SSMConfig(enabled=True),
    )

    def __init__(self, event: dict[Any, Any], context: dict[Any, Any]) -> None:
        self.event = event
        self.context = context
        self.env = os.environ.get("ENV")
        self.hostname = os.environ.get("HOSTNAME")
        self.site_url = f"http{'' if self.env == 'local' else 's'}://{self.hostname}"
        self.user = {
            "username": None,
            "groups": None,
        }
        self._init()

    def __preinit_aws(self):
        # Initialize SSM first to get parameters to decode token
        self.aws_session = (
            boto3.session.Session(profile_name="aseaman")
            if self.is_local
            else boto3.session.Session()
        )

        self.aws = AWS(
            dynamodb=DynamoDB(client=None, tables={}),
            s3=S3(client=None, buckets={}),
            ssm=SSM(client=None),
        )
        self.aws.ssm.client = self.ssm_client = self.aws_session.client(
            "ssm", region_name=self.region
        )

    def __init_aws(self):
        if self.aws_config.dynamodb.enabled:
            self.aws.dynamodb.client = self.aws_session.client(
                "dynamodb", region_name="us-east-1"
            )
            self.aws.dynamodb.tables = {}

            for table in self.aws_config.dynamodb.tables:
                table_name = self.build_table_name(table.name)
                self.aws.dynamodb.tables[table.name] = table.TableClass(
                    table_name=table_name,
                    ddb_client=self.aws.dynamodb.client,
                    user=self.user,
                )
        if self.aws_config.s3.enabled:
            self.aws.s3.client = self.aws_session.client("s3", region_name=self.region)
            self.aws.s3.buckets = {}
            for bucket_config in self.aws_config.s3.buckets:
                self.aws.s3.buckets[bucket_config.name] = S3Bucket(
                    bucket_name=bucket_config.bucket_name,
                    prefix=bucket_config.prefix,
                    s3_client=self.aws.s3.client,
                )

    def _init(self):
        pass

    @property
    def is_local(self):
        return os.environ.get("IN_DOCKER_API") == "true"

    def build_table_name(self, table_name: str) -> str:
        if self.env == "live":
            return table_name
        return f"{table_name}_{self.env}"

    @property
    def user_pool_id_ssm_key(self) -> str:
        env = "stage" if self.env == "local" else self.env
        return f"/aseaman/{env}/cognito/user_pool_id"

    @property
    def user_pool_client_id_ssm_key(self) -> str:
        env = "stage" if self.env == "local" else self.env
        return f"/aseaman/{env}/cognito/user_pool_client_id"

    def get_from_ssm(self, key: str) -> str:
        response = self.aws.ssm.client.get_parameter(Name=key)
        return response["Parameter"]["Value"]

    def __parse_event(self, event: dict[Any, Any]) -> None:
        print(" -- Received event --")
        # print(json.dumps(event, indent=4))
        print(" --                --")

        params: dict[Any, Any] = {}
        http_method: str | None = event.get("httpMethod", None)
        if http_method in {"GET", "DELETE"}:
            params = self.event["multiValueQueryStringParameters"] or {}
            params.update(self.event["queryStringParameters"] or {})
        elif http_method in {"POST", "PUT"}:
            if isinstance(self.event["body"], dict):
                params = self.event["body"]
            else:
                try:
                    params = json.loads(self.event["body"])
                except:
                    params = {"body": self.event["body"]}
        self.params = params

    def get_query_params(self, keys: list[str]) -> dict[str, Any]:
        return {k: v for k, v in self.params.items() if k in keys}

    def __decode_token(self) -> None:
        if "headers" not in self.event:
            return
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

    def _before_run(self):
        self._init()
        self.__preinit_aws()
        self.__decode_token()
        self.__init_aws()
        self.__parse_event(self.event)

    def _empty_response(self):
        return copy.deepcopy(EMPTY_RESPONSE)

    def get_resource(self):
        path_parts = self.event["path"].strip("/").split("/")
        return path_parts[1] if len(path_parts) > 1 else None

    def get_headers(self):
        return self.event["headers"]

    def handle(self) -> dict[str, Any]:
        raise NotImplementedError("handle method must be implemented in subclasses")

    def _handle_api_error(self, e: Exception) -> None:
        print("API error!")
        print("API error: {}".format(e))
        traceback.print_exc()

    def _handle_error(self, e: Exception) -> None:
        print("Uh oh, error!")
        print("error: {}".format(e))
        traceback.print_exc()


class APILambdaHandlerBase(LambdaHandlerBase):
    def __init__(self, event: dict[Any, Any], context: dict[Any, Any]):
        super().__init__(event, context)

        self.handlers_by_method: dict[str, Callable[..., dict[Any, Any]]] = {
            "GET": self.handle_get,
            "POST": self.handle_post,
            "PUT": self.handle_put,
            "DELETE": self.handle_delete,
        }

    def handle_get(self):
        raise MethodNotAllowedException("GET not supported")

    def handle_post(self):
        raise MethodNotAllowedException("POST not supported")

    def handle_put(self):
        raise MethodNotAllowedException("PUT not supported")

    def handle_delete(self):
        raise MethodNotAllowedException("DELETE not supported")

    def handle(self) -> dict[str, Any]:
        print(self.event)

        response: dict[str, Any] = {**EMPTY_RESPONSE}
        if "httpMethod" not in self.event:
            response["statusCode"] = 400
            response["body"] = json.dumps({"error": "httpMethod not provided"})
            return response

        http_method: str = self.event["httpMethod"]
        try:
            self._before_run()
            handler: Callable[..., dict[Any, Any]] | None = self.handlers_by_method.get(
                http_method, None
            )
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
