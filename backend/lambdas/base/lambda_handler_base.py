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

    def _parse_event(self, event):
        self.is_local = event.get('local', False)

    def _before_run(self):
        pass

    def _run(self):
        raise NotImplementedError()

    def _after_run(self, result):
        print("result: {}".format(result))

    def handle(self):
        try:
            self._before_run()
            result = self._run()
            self._after_run(result)
        except Exception as e:
            print('Uh oh, error!')
            self._handle_error(e)
            traceback.print_exc()

    def _handle_error(self, e):
        print("error: {}".format(e))
