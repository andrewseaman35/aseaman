import datetime
import json
import os
import traceback

import boto3

from .exceptions import APIException, BadRequestException, UnauthorizedException, BaseAPIException


SSM_API_KEY = 'lambda-api-key'

class APILambdaHandlerBase(object):
    require_auth = True
    validation_actions = {}

    def __init__(self, event, context):
        self.event = event
        self.context = context
        self.action = None
        self.api_key = None

    def __init_aws(self):
        self.aws_session = (boto3.session.Session(profile_name='aseaman') if self.is_local
                            else boto3.session.Session())
        self.ssm_client = self.aws_session.client('ssm', region_name='us-east-1')
        self._init_aws()

    def _init(self):
        pass

    def _init_aws(self):
        pass

    @property
    def __api_key(self):
        response = self.ssm_client.get_parameter(Name=SSM_API_KEY)
        value = response['Parameter']['Value']
        return value

    def _empty_response(self):
        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {},
            "body": json.dumps({})
        }

    def __parse_payload(self, payload):
        self._parse_payload(payload)
        if self.require_auth:
            self.api_key = payload.get('api_key')
            if not self.api_key:
                raise UnauthorizedException('api_key parameter required')
            if not self.__api_key or not self.api_key == self.__api_key:
                raise UnauthorizedException('invalid api key')

    def _parse_payload(self, payload):
        raise NotImplementedError

    def __parse_event(self, event):
        print(" -- Received event --")
        print(json.dumps(event, indent=4))
        print(" --                --")

        payload = event if self.is_local else json.loads(event['body'])
        self.__parse_payload(payload)

    def __validate_event(self):
        if not self.action:
            return
        validate = self.validation_actions.get(self.action, lambda: True)
        validate()

    def __before_run(self):
        self.is_local = self.event.get('local', False)
        self._init()
        self.__init_aws()
        self.__parse_event(self.event)
        self.__validate_event()
        self._before_run()

    def _before_run(self):
        pass

    def _run(self):
        raise NotImplementedError()

    def __after_run(self, result):
        self._after_run(result)

    def _after_run(self, result):
        print("result: {}".format(result))

    def handle(self):
        result = self._empty_response()
        try:
            self.__before_run()
            result = self._run()
            self.__after_run(result)
        except BaseAPIException as e:
            self._handle_api_error(e)
            result = e.to_json_response()
        except Exception as e:
            self._handle_error(e)
            result = APIException().to_json_response()

        print (result)
        return result

    def _handle_api_error(self, e):
        print('API error!')
        print("API error: {}".format(e))
        traceback.print_exc()

    def _handle_error(self, e):
        print('Uh oh, error!')
        print("error: {}".format(e))
        traceback.print_exc()

