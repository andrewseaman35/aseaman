import argparse
import boto3
import json
import os

VALID_ENVS = {'test', 'stage', 'live'}
VALID_SOURCES = {'env', 'stack_param', 'ssm'}

LOCAL_FILE = '{root}/config/local.json'
TEMPLATE_FILE = '{root}/config/web_template.json'
OUTPUT_FILE = '{root}/website/js/src/config.js'

class GenerateConfig():
    def __init__(self):
        self.parser = argparse.ArgumentParser()
        self._setup_parser()
        self.args = self.parser.parse_args()
        self.local = self.args.local

        self.cf_client = boto3.client('cloudformation', region_name='us-east-1')
        self.ssm_client = boto3.client('ssm', region_name='us-east-1')

        self.root = os.environ.get('ROOTDIR', os.getcwd())
        self.stack_name = os.environ['STACKNAME']
        self.env = os.environ['DEPLOY_ENV']

        self.local_file = LOCAL_FILE.format(root=self.root)
        self.template_file = TEMPLATE_FILE.format(root=self.root)
        self.output_filename = OUTPUT_FILE.format(root=self.root)

        self.stack_exports = None
        self.source_map = {
            'env': self.get_from_env,
            'stack_param': self.get_from_stack_export,
            'ssm': self.get_from_ssm,
        }

    def _setup_parser(self):
        self.parser.add_argument("--local", help="add if running locally", action='store_true')

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
        key = "{}-{}".format(key, self.env)
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

    def get_data(self):
        with open(self.template_file, 'r') as template_file:
            template_data = json.load(template_file)

        for item in template_data.values():
            if item['source'] not in VALID_SOURCES:
                raise ValueError("Invalid config source: {}".format(value))

        output_data = {}
        for key, item in template_data.items():
            source = item['source']
            param_key = item.get('key', key)
            output_data[key] = self.source_map[source](param_key)

        return output_data

    def run(self):
        if self.local:
            output_data = self.get_local_data()
        else:
            output_data = self.get_data()

        js_content = "const CONFIG = {config_json};".format(
            config_json=json.dumps(output_data, indent=4)
        ).replace('"', "'")

        os.makedirs(os.path.dirname(self.output_filename), exist_ok=True)
        with open(self.output_filename, 'w') as output_file:
            output_file.write(js_content)
            output_file.write("\n")
            output_file.write("module.exports = CONFIG;")

        return self.output_filename


if __name__ == '__main__':
    GenerateConfig().run()
