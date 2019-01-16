import datetime
import json
import os
import traceback

import boto3


class APILambdaHandlerBase(object):
    def __init__(self, event, context):
        self.event = event
        self.context = context
        self._parse_event(self.event)
        self._init_aws()

    def _init_aws(self):
        self.aws_session = (boto3.session.Session(profile_name='aseaman') if self.is_local
                            else boto3.session.Session())

    def _empty_response(self):
        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {},
            "body": json.dumps({})
        }

    def _parse_payload(self, payload):
        raise NotImplementedError

    def _parse_event(self, event):
        print(" -- Received event --")
        print(json.dumps(event, indent=4))
        print(" --                --")

        self.is_local = event.get('local', False)

        payload = event if self.is_local else json.loads(event['body'])
        self._parse_payload(payload)

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
