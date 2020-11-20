import boto3
import re

from base import BaseScript

REGEX_WITH_BRANCH = r'^stack-{env}-(?P<branch>.*)-(?P<nonce>[^-]*)$'
REGEX_WITHOUT_BRANCH = r'^stack-{env}-(?P<nonce>[^-]*)$'

STATES_TO_DELETE = ['CREATE_COMPLETE', 'DELETE_FAILED']
VALID_ENVS = {'test', 'stage', 'live'}
STACKNAME_REGEXES = {
    'test': re.compile(REGEX_WITH_BRANCH.format(env='test')),
    'stage': re.compile(REGEX_WITHOUT_BRANCH.format(env='stage')),
    'live': re.compile(REGEX_WITHOUT_BRANCH.format(env='live')),
}


class RemoveOldStacks(BaseScript):
    """
    Deletes old stacks.

    Requires environment variables:
        DEPLOY_ENV: current deploy environment ('test', 'stage', 'live')
        STACKNAME: name of currently deployed stack in environment (is not deleted)
        BRANCH: if DEPLOY_ENV == 'test', branch to delete stacks for
    """

    def _setup_parser(self):
        super(RemoveOldStacks, self)._setup_parser()
        self.parser.add_argument("--stack-name", dest="stack_name", help="cloudformation stack name")
        self.parser.add_argument("--deploy-env", dest="deploy_env", help="test, stage, live")
        self.parser.add_argument("--branch", dest="branch", help="test, stage, live")

    def _validate_args(self):
        super(RemoveOldStacks, self)._validate_args()
        self.stack_name = self.args.stack_name
        self.deploy_env = self.args.deploy_env
        if self.stack_name is None:
            raise ValueError("--stack-name is required")
        if self.deploy_env is None:
            raise ValueError("--deploy-env is required")
        if self.deploy_env == 'test':
            self.branch = self.args.branch
            if self.branch is None:
                raise ValueError("--branch is required when deploy_env is test")

        if self.deploy_env not in VALID_ENVS:
            raise ValueError("Invalid deploy env: {}".format(self.deploy_env))

    def _init_aws(self):
        super(RemoveOldStacks, self)._init_aws()
        self.client = self.aws_session.client('cloudformation', region_name='us-east-1')

    def _run(self):
        out = "Deleting old stacks for {}".format(self.deploy_env)
        if self.deploy_env == 'test':
            out += ", branch: {}".format(self.branch)
        print(out)

        stack_summaries = self.client.list_stacks(
            StackStatusFilter=STATES_TO_DELETE
        )['StackSummaries']

        regex = STACKNAME_REGEXES[self.deploy_env]
        matched_stacks = []
        stacks_to_delete = []
        for summary in stack_summaries:
            stack_name = summary['StackName']
            match = regex.match(stack_name)
            if not match:
                continue

            matched_stacks.append(stack_name)
            if stack_name == self.stack_name:
                continue
            if self.deploy_env == 'test' and self.branch != match.group('branch'):
                continue

            stacks_to_delete.append(stack_name)

        if len(matched_stacks) > len(stacks_to_delete):
            for stack_name in stacks_to_delete:
                print("Deleting stack {}".format(stack_name))
                response = self.client.delete_stack(
                    StackName=stack_name,
                )

        print("Deleted {} stack{}".format(len(stacks_to_delete), '' if len(stacks_to_delete) == 1 else 's'))


if __name__ == '__main__':
    RemoveOldStacks().run()
