import argparse
import subprocess
import time

import boto3


class BaseScript(object):
    aws_enabled = True

    def __init__(self):
        self.parser = argparse.ArgumentParser()
        self._setup_parser()

        self.args = self.parser.parse_args()
        self._validate_args()

        self.root = (
            subprocess.Popen(
                ["git", "rev-parse", "--show-toplevel"], stdout=subprocess.PIPE
            )
            .communicate()[0]
            .rstrip()
            .decode("utf-8")
        )

        if self.aws_enabled:
            self._init_aws()

    def log(self, t):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        print("{}: {}".format(timestamp, t))

    def confirm(self, message):
        confirm = input(f"{message} (y/n): ")
        return confirm.strip().lower() in {"y", "yes"}

    def _setup_parser(self):
        if self.aws_enabled:
            self.parser.add_argument("--profile", help="AWS profile to use")
        self.parser.add_argument(
            "--local", help="add if running locally", action="store_true"
        )

    def _validate_args(self):
        self.local = self.args.local
        self.aws_profile = self.args.profile if self.aws_enabled else None

    def _init_aws(self):
        self.aws_session = (
            boto3.session.Session(profile_name=self.aws_profile)
            if self.aws_profile
            else boto3.session.Session()
        )

    def _run(self):
        raise NotImplementedError

    def run(self):
        self._run()


if __name__ == "__main__":
    BaseScript().run()
