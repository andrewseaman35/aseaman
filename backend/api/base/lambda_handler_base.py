import datetime
import json
import os
import traceback

import boto3

from .api_exceptions import APIException, BadRequestException, UnauthorizedException, BaseAPIException


SSM_API_KEY = 'lambda-api-key'

class APILambdaHandlerBase(object):
    require_auth = True
    action = None
    rest_enabled = False
    validation_actions = {}

    def __init__(self, event, context):
        self.event = event
        self.context = context
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
        if value_type == 'S':
            return str(value)
        elif value_type == 'N':
            return int(value)
        elif value_type == 'L':
            return [cls._parse_ddb_value_type_map(val) for val in value]
        elif value_type == 'M':
            return {
                key: cls._parse_ddb_value_type_map(val) for (key, val) in value.items()
            }
        else:
            raise Exception('unsupported value: {}'.format(value_type))

    def _empty_response(self):
        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "multiValueHeaders": {},
            "body": json.dumps({})
        }

    def _preflight_response(self):
        return {
            **self._empty_response(),
            "headers": {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
            },
        }

    def __parse_payload(self, payload):
        if self.rest_enabled:
            self.payload = payload
            return

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

        if self.rest_enabled:
            params = {}
            if self.event['httpMethod'] == 'GET':
                params = self.event['queryStringParameters'] or {}
            elif self.event['httpMethod'] == 'POST':
                params = json.loads(self.event['body'])
            self.params = params
        else:
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
        if not self.rest_enabled:
            self.__validate_event()
        self._before_run()

    def _before_run(self):
        pass

    def _run(self):
        raise NotImplementedError()

    def handle_options(self):
        print("-- handling options")
        return self._preflight_response()

    def handle_get(self):
        print("-- handling get")
        raise NotImplemented('no get')

    def handle_post(self):
        print("-- handling post")
        raise NotImplemented('blargh')

    def handle_rest(self):
        print(self.event)
        print("Handling: {}".format(self.event.get('httpMethod')))
        # Handle preflight
        if self.event.get('httpMethod') == 'OPTIONS':
            return self.handle_options()

        response = self._empty_response()
        try:
            self.__before_run()
            if self.event.get('httpMethod') == 'GET':
                response = self.handle_get()
            elif self.event.get('httpMethod') == 'POST':
                response = self.handle_post()
        except BaseAPIException as e:
            self._handle_api_error(e)
            response = e.to_json_response()
        except Exception as e:
            self._handle_error(e)
            response = APIException().to_json_response()

        print(response)
        return response

    def handle(self):
        if self.rest_enabled:
            return self.handle_rest()

        self.is_preflight = self.event.get('httpMethod') == 'OPTIONS'
        if self.is_preflight:
            return self._preflight_response()

        result = self._empty_response()
        try:
            self.__before_run()
            result = self._run()
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
