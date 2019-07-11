import datetime
import json
import os
import traceback

import boto3


SSM_API_KEY = 'lambda-api-key'

class APILambdaHandlerBase(object):
    require_auth = True

    def __init__(self, event, context):
        self.event = event
        self.context = context

        self.is_local = event.get('local', False)

        self._init()
        self.__init_aws()
        self.__parse_event(self.event)

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
                raise ValueError('missing api_key in event')
            if not self.__api_key or not self.api_key == self.__api_key:
                raise ValueError('invalid api key')

    def _parse_payload(self, payload):
        raise NotImplementedError

    def __parse_event(self, event):
        print(" -- Received event --")
        print(json.dumps(event, indent=4))
        print(" --                --")

        payload = event if self.is_local else json.loads(event['body'])
        self.__parse_payload(payload)

    def _before_run(self):
        pass

    def _run(self):
        raise NotImplementedError()

    def _after_run(self, result):
        print("result: {}".format(result))

    def handle(self):
        result = self._empty_response()
        try:
            self._before_run()
            result = self._run()
            self._after_run(result)
        except Exception as e:
            print('Uh oh, error!')
            self._handle_error(e)
            traceback.print_exc()
        finally:
            return result

    def _handle_error(self, e):
        print("error: {}".format(e))
