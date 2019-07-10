from .lambda_handler_base import APILambdaHandlerBase

SSM_API_KEY = 'lambda-api-key'


class AuthedAPILambdaHandlerBase(APILambdaHandlerBase):
    def __init__(self, event, context):
        self.api_key = None
        super(AuthedAPILambdaHandlerBase, self).__init__(event, context)
        self._validate_api_key()

    def _validate_api_key(self):
        if not self.api_key == self._api_key:
            raise ValueError('invalid api key')

    def _init_aws(self):
        super(AuthedAPILambdaHandlerBase, self)._init_aws()
        self.ssm_client =self.aws_session.client('ssm', region_name='us-east-1')

    def __parse_payload(self, payload):
        self.api_key = payload.get('api_key')
        if not self.api_key:
            raise ValueError('missing api_key in event')

    @property
    def _api_key(self):
        response = self.ssm_client.get_parameter(Name=SSM_API_KEY)
        value = response['Parameter']['Value']
        return value

