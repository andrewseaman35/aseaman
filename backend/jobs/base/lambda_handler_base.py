import json
import os
import traceback

import boto3

from .aws import AWSConfig, DynamoDBConfig, S3Config, SSMConfig, AWS, S3BucketConfig
from .s3 import S3Bucket


CREATION_EVENT_NAME = "ObjectCreated:Put"


class JobLambdaHandlerBase(object):
    rest_enabled = True
    region = "us-east-1"

    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(enabled=False),
        s3=S3Config(enabled=False),
        ssm=SSMConfig(enabled=True),
    )

    def __init__(self, event, context):
        self.event = event
        self.context = context
        self.env = os.environ.get("ENV")

    def __init_aws(self):
        self.aws_session = boto3.session.Session()

        self.aws = AWS()
        if self.aws_config.dynamodb.enabled:
            self.aws.dynamodb.client = self.aws_session.client(
                "dynamodb", region_name="us-east-1"
            )
            self.aws.dynamodb.tables = {}

            for table in self.aws_config.dynamodb.tables:
                table_name = self.build_table_name(table.name)
                self.aws.dynamodb.tables[table.name] = table.TableClass(
                    table_name, self.aws.dynamodb.client
                )
        if self.aws_config.s3.enabled:
            self.aws.s3.client = self.aws_session.client("s3", region_name=self.region)
            self.aws.s3.buckets = {}
            for bucket_config in self.aws_config.s3.buckets:
                self.aws.s3.buckets[bucket_config.name] = S3Bucket(
                    bucket_name=bucket_config.bucket_name,
                    prefix=bucket_config.prefix,
                    s3_client=self.aws.s3.client,
                )

        if self.aws_config.ssm.enabled:
            self.aws.ssm.client = self.ssm_client = self.aws_session.client(
                "ssm", region_name=self.region
            )

    def _init(self):
        pass

    def build_table_name(self, table_name):
        if self.env == "live":
            return table_name
        return f"{table_name}_{self.env}"

    def __parse_event(self, event):
        print(" -- Received event --")
        print(json.dumps(event, indent=4))
        print(" --                --")

        records = event["Records"]
        changes = []
        for record in records:
            if record["eventName"] != CREATION_EVENT_NAME:
                continue

            name = record["s3"]["object"]["key"]
            changes.append(name.split("budget/")[1])

        self.changes = changes

    def __before_run(self):
        self._init()
        self.__init_aws()
        self.__parse_event(self.event)

    def handle(self):
        print(self.event)

        try:
            self.__before_run()
            self._run()
        except Exception as e:
            self._handle_error(e)

        return {}

    def _handle_error(self, e):
        print("Uh oh, error!")
        print("error: {}".format(e))
        traceback.print_exc()
