import argparse
import boto3
import json
import os

from base import BaseScript

VALID_ENVS = {'test', 'stage', 'live'}
VALID_SOURCES = {'env', 'stack_param', 'ssm', 'public'}

PUBLICS_FILENAME_FORMAT = '{root}/config/publics.json'

LOCAL_FILENAME_FORMAT = '{root}/config/local.json'
TEMPLATE_FILENAME_FORMAT = '{root}/config/web_template.json'
OUTPUT_FILENAME_FORMAT = '{root}/website/js/src/config.js'
TEMPLATE_CONFIG_FILENAME_FORMAT = '{root}/website/config.json'

class GenerateConfig(BaseScript):
    def __init__(self):
        super(GenerateConfig, self).__init__()

        self.local_file = LOCAL_FILENAME_FORMAT.format(root=self.root)
        self.template_file = TEMPLATE_FILENAME_FORMAT.format(root=self.root)
        self.output_file = OUTPUT_FILENAME_FORMAT.format(root=self.root)
        self.template_config_file = TEMPLATE_CONFIG_FILENAME_FORMAT.format(root=self.root)
        self.publics_file = PUBLICS_FILENAME_FORMAT.format(root=self.root)

        self.stack_exports = None
        self.publics = None
        self.source_map = {
            'env': self.get_from_env,
            'stack_param': self.get_from_stack_export,
            'ssm': self.get_from_ssm,
            'public': self.get_public,
        }

    def _setup_parser(self):
        super(GenerateConfig, self)._setup_parser()
        self.parser.add_argument("--deploy-env", dest="deploy_env", help="test, stage, live")

    def _validate_args(self):
        super(GenerateConfig, self)._validate_args()
        self.deploy_env = self.args.deploy_env
        if not self.local:
            if self.deploy_env is None:
                raise ValueError("--deploy-env is required")
            if self.deploy_env not in VALID_ENVS:
                raise ValueError("Invalid deploy_env")
        else:
            self.deploy_env = 'local'

    def _init_aws(self):
        super(GenerateConfig, self)._init_aws()
        self.cf_client = self.aws_session.client('cloudformation', region_name='us-east-1')
        self.ssm_client = self.aws_session.client('ssm', region_name='us-east-1')

    def get_stack_output_dict(self):
        """Get stack outputs and convert to dict."""
        stacks = self.cf_client.describe_stacks(StackName=self.stack_name)
        return {
            output['OutputKey']: output['OutputValue']
            for output in stacks['Stacks'][0]['Outputs']
        }

    def get_from_stack_export(self, key):
        """Use a Cloudformation stack export as a config value."""
        if self.stack_exports is None:
            self.stack_exports = self.get_stack_output_dict()

        return self.stack_exports[key]

    def get_from_ssm(self, key):
        """Get value from Parameter Store."""
        key = "{}-{}".format(key, self.deploy_env)
        response = self.ssm_client.get_parameter(Name=key)
        return response['Parameter']['Value']

    def get_from_env(self, key):
        """Use an environment variable as a config value."""
        return os.environ[key]

    def get_local_data(self):
        """Copy config from local.json."""
        with open(self.local_file, 'r') as local_file:
            local_data = json.load(local_file)

        return local_data

    def get_public(self, key):
        """Use a public constant defined in publics.json."""
        if self.publics is None:
            with open(self.publics_file, 'r') as publics_file:
                self.publics = json.load(publics_file)
        return self.publics[self.deploy_env][key]

    def get_data(self):
        with open(self.template_file, 'r') as template_file:
            template_data = json.load(template_file)

        for item in template_data.values():
            if item['source'] not in VALID_SOURCES:
                raise ValueError("Invalid config source: {}".format(item))

        output_data = {}
        for key, item in template_data.items():
            source = item['source']
            param_key = item.get('key', key)
            output_data[key] = self.source_map[source](param_key)

        return output_data

    def run_postprocess(self, data):
        # Append the sandbox prefix for the testing hub
        if self.deploy_env == 'test':
            data['ROOT_URL'] = '{ROOT_URL}sandboxes/{BRANCH}/'.format(**data)

        return data

    def _run(self):
        if self.local:
            output_data = self.get_local_data()
        else:
            output_data = self.get_data()

        output_data = self.run_postprocess(output_data)

        js_content = "const CONFIG = {config_json};".format(
            config_json=json.dumps(output_data, indent=4)
        ).replace('"', "'")

        os.makedirs(os.path.dirname(self.output_file), exist_ok=True)
        with open(self.template_config_file, 'w') as output_file:
            output_file.write(json.dumps(output_data, indent=4))

        with open(self.output_file, 'w') as output_file:
            output_file.write(js_content)
            output_file.write("\n")
            output_file.write("module.exports = CONFIG;")

        return self.output_file


if __name__ == '__main__':
    GenerateConfig().run()
