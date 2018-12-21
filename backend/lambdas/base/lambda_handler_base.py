import datetime
import json
import os
import traceback

import boto3


class APILambdaHandlerBase():
    def _parse_event(self, event):
        self.is_local = event.get('local', False)

    def _before_run(self, event):
        self._parse_event(event)

    def _run(self, event, context):
        raise NotImplementedError()

    def _after_run(self, result):
        print("result: {}".format(result))

    def handle(self, event, context):
        try:
            self._before_run(event)
            result = self._run(event, context)
            self._after_run(result)
        except Exception as e:
            print('Uh oh, error!')
            self._handle_error(e)
            traceback.print_exc()

    def _handle_error(self, e):
        print("error: {}".format(e))
