import boto3
import os
import re

REGEX_WITH_BRANCH = r'^stack-{env}-(?P<branch>.*)-(?P<nonce>[^-]*)$'
REGEX_WITHOUT_BRANCH = r'^stack-{env}-(?P<nonce>[^-]*)$'

VALID_ENVS = {'test', 'stage', 'live'}
STACKNAME_REGEXES = {
    'test': re.compile(REGEX_WITH_BRANCH.format(env='test')),
    'stage': re.compile(REGEX_WITHOUT_BRANCH.format(env='stage')),
    'live': re.compile(REGEX_WITHOUT_BRANCH.format(env='live')),
}


class RemoveOldStacks():
    """
    Deletes old stacks.

    Requires environment variables:
        DEPLOY_ENV: current deploy environment ('test', 'stage', 'live')
        STACKNAME: name of currently deployed stack in environment (is not deleted)
        BRANCH: if DEPLOY_ENV == 'test', branch to delete stacks for
    """
    def __init__(self):
        self.client = boto3.client('cloudformation', region_name='us-east-1')

        self.stack_name = os.environ['STACKNAME']
        self.deploy_env = os.environ['DEPLOY_ENV']
        if self.deploy_env == 'test':
            self.branch = os.environ['BRANCH']

        if self.deploy_env not in VALID_ENVS:
            raise ValueError("Invalid deploy env: {}".format(self.deploy_env))

    def run(self):
        out = "Deleting old stacks for {}".format(self.deploy_env)
        if self.deploy_env == 'test':
            out += ", branch: {}".format(self.branch)
        print(out)

        stack_summaries = self.client.list_stacks(
            StackStatusFilter=['CREATE_COMPLETE']
        )['StackSummaries']

        count = 0
        regex = STACKNAME_REGEXES[self.deploy_env]
        for summary in stack_summaries:
            stack_name = summary['StackName']
            match = regex.match(stack_name)
            if not match or stack_name == self.stack_name:
                continue
            if self.deploy_env == 'test' and self.branch != match.group('branch'):
                continue

            count += 1
            print("Deleting stack {}".format(stack_name))
            response = self.client.delete_stack(
                StackName=stack_name,
            )

        print("Deleted {} stacks".format(count))


if __name__ == '__main__':
    RemoveOldStacks().run()
