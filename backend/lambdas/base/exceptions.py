import json

class BaseAPIException(Exception):
    DEFAULT_MESSAGE = 'error'

    def __init__(self, message=None):
        message = message or self.DEFAULT_MESSAGE
        super(BaseAPIException, self).__init__(message)

    @property
    def body(self):
        return json.dumps({
            'message': self.message,
        })

    @property
    def headers(self):
        return {}

    def to_json_response(self):
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
    SETATUS_CODE = 401
    DEFAULT_MESSAGE = 'unauthorized'
