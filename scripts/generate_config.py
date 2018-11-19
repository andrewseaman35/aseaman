import json
import os

VALID_ENVS = {'test', 'stage', 'live'}

ENV_KEY_FORMAT = '_CONFIG_{key}'
TEMPLATE_FILE = '{root}/config/web_template.json'
OUTPUT_FILE = '{root}/website/config/config.js'

class GenerateConfig():
    def setup(self):
        self.root = os.environ.get('ROOTDIR', os.getcwd())
        self.template_file = TEMPLATE_FILE.format(root=self.root)
        self.output_filename = OUTPUT_FILE.format(root=self.root)

    def run(self):
        self.setup()

        with open(self.template_file, 'r') as template_file:
            template_data = json.load(template_file)

        output_data = {
            key: os.environ[key] for key in template_data
        }

        js_content = "const CONFIG = {config_json};".format(
            config_json=json.dumps(output_data, indent=4)
        ).replace('"', "'")

        with open(self.output_filename, 'w') as output_file:
            output_file.write(js_content)

        return self.output_filename


if __name__ == '__main__':
    GenerateConfig().run()
