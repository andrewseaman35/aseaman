import argparse
import importlib
import json
import os.path

import boto3


TEST_PAYLOAD_DIRECTORY = "test_payloads"


class Invoke:
    def __init__(self):
        self.parser = argparse.ArgumentParser()
        self._setup_parser()
        self.args = self.parser.parse_args()
        self.local = self.args.local

        self.payload = self.args.payload
        if self.payload and not self.payload.endswith(".json"):
            self.payload += ".json"

        if not self.args.local:
            self.init_aws()

        self.lambda_function_name = self.args.lambda_function_name.strip("/")

    def init_aws(self):
        self.aws_profile = self.args.profile
        session = (
            boto3.session.Session(profile_name=self.aws_profile)
            if self.aws_profile
            else boto3.session.Session()
        )
        self.lambda_client = session.client("lambda", region_name="us-east-1")

    def _setup_parser(self):
        self.parser.add_argument(
            "lambda_function_name", help="subdirectory of lambda function"
        )
        self.parser.add_argument(
            "--local",
            help="add if running locally, disables SNS and DDB calls",
            action="store_true",
        )
        self.parser.add_argument("--payload", help="name of payload file")
        self.parser.add_argument("--profile", help="AWS profile to use")

    def _get_payload(self):
        payload = {
            "local": self.local,
            "local_dir": self.lambda_function_name,
        }
        if self.payload:
            with open(os.path.join(TEST_PAYLOAD_DIRECTORY, self.payload)) as json_file:
                additional_payload = json.load(json_file)
            payload.update(additional_payload)

        return payload

    def _run(self, payload=None):
        kwargs = {"FunctionName": self.lambda_function_name}
        if payload:
            kwargs["Payload"] = json.dumps({"body": json.dumps(payload)})
        response = self.lambda_client.invoke(**kwargs)
        print(response["Payload"].read())

    def run(self):
        payload = self._get_payload()
        if not self.args.local:
            self._run(payload=payload)
        else:
            # Is this too hacky? :/
            handler = importlib.import_module(
                "{}.lambda_handler".format(self.lambda_function_name)
            )
            handler.lambda_handler(payload, None)


if __name__ == "__main__":
    Invoke().run()
