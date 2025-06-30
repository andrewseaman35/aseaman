import json
from typing import Any


class BaseAPIException(Exception):
    DEFAULT_MESSAGE: str = "error"
    STATUS_CODE: int = 500

    def __init__(self, message: str | None = None):
        self.message = message or self.DEFAULT_MESSAGE
        super(BaseAPIException, self).__init__(message)

    @property
    def body(self) -> str:
        return json.dumps(
            {
                "message": self.message,
            }
        )

    @property
    def headers(self):
        return {"Access-Control-Allow-Origin": "*"}

    def to_json_response(self) -> dict[str, Any]:
        return {
            "isBase64Encoded": False,
            "statusCode": self.STATUS_CODE,
            "headers": self.headers,
            "body": self.body,
        }


class APIException(BaseAPIException):
    STATUS_CODE = 500
    DEFAULT_MESSAGE = "server error"


class BadRequestException(BaseAPIException):
    STATUS_CODE = 400
    DEFAULT_MESSAGE = "bad request"


class UnauthorizedException(BaseAPIException):
    STATUS_CODE = 401
    DEFAULT_MESSAGE = "unauthenticated"


class ForbiddenException(BaseAPIException):
    STATUS_CODE = 403
    DEFAULT_MESSAGE = "forbidden"


class NotFoundException(BaseAPIException):
    STATUS_CODE = 404
    DEFAULT_MESSAGE = "not found"


class MethodNotAllowedException(BaseAPIException):
    STATUS_CODE = 405
    DEFAULT_MESSAGE = "method not allowed"


class UnsupportedMediaTypeException(BaseAPIException):
    STATUS_CODE = 415
    DEFAULT_MESSAGE = "unsupported media type"
