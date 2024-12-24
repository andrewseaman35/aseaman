from dataclasses import dataclass

from base.lambda_handler_base import JobLambdaHandlerBase, CREATION_EVENT_NAME
from base.aws import (
    AWSConfig,
    S3Config,
    S3BucketConfig,
    DynamoDBConfig,
    DynamoDBTableConfig,
)
from base.dynamodb import DynamoDBItem, DynamoDBItemValueConfig, DynamoDBTable
from base.helpers import generate_id, get_timestamp


UPLOADS_PREFIX = "budget/uploads"


@dataclass
class FileState:
    UPLOADED = "uploaded"
    PROCESSED = "processed"


class BudgetFileDDBItem(DynamoDBItem):
    _config = {
        "owner": DynamoDBItemValueConfig("S"),
        "id": DynamoDBItemValueConfig("S", default=generate_id),
        "state": DynamoDBItemValueConfig("S"),
        "s3_key": DynamoDBItemValueConfig("S", internal=True),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None),
    }

    @property
    def ddb_key(self):
        return self.build_ddb_key(owner=self.owner, s3_key=self.s3_key)

    @classmethod
    def build_ddb_key(cls, *args, owner=None, s3_key=None, **kwargs):
        assert owner is not None, "owner required to build ddb key"
        assert s3_key is not None, "s3_key required to build ddb key"
        return {
            "owner": {
                "S": owner,
            },
            "s3_key": {"S": s3_key},
        }


class BudgetFileTable(DynamoDBTable):
    ItemClass = BudgetFileDDBItem


class BudgetFileLambdaHandler(JobLambdaHandlerBase):
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig(
                    name="budget_file",
                    TableClass=BudgetFileTable,
                )
            ],
        ),
        s3=S3Config(
            enabled=True,
            buckets=[
                S3BucketConfig(
                    name="uploads",
                    bucket_name="aseaman-protected",
                    prefix=UPLOADS_PREFIX,
                )
            ],
        ),
    )

    def _init(self):
        self.env = "local"
        self.prefix = UPLOADS_PREFIX

    def _handle_created(self, created):
        key = f"{self.prefix}/{created}"
        owner = created.split("/")[1]
        filename = self.aws.s3.buckets["uploads"].download(key)

        scan_dict = {
            "owner": owner,
            "s3_key": created,
        }
        print(scan_dict)
        records = self.aws.dynamodb.tables["budget_file"].scan(scan_dict=scan_dict)
        if len(records) == 0:
            raise Exception(f"No records found for {scan_dict}")
        elif len(records) > 1:
            raise Exception(f"Multiple records found for {scan_dict}")

        record = records[0]
        update_dict = {
            "state": {
                "value": FileState.PROCESSED,
                "operation": "SET",
            },
        }
        print(f"Key: {record.ddb_key}")
        self.aws.dynamodb.tables["budget_file"].update(
            key=record.ddb_key,
            update_dict=update_dict,
        )

    def _run(self, changes):
        for created in changes[CREATION_EVENT_NAME]:
            self._handle_created(created)


def lambda_handler(event, context):
    return BudgetFileLambdaHandler(event, context).handle()


# event = {'Records': [{'eventVersion': '2.1', 'eventSource': 'aws:s3', 'awsRegion': 'us-east-1', 'eventTime': '2024-12-24T03:50:16.780Z', 'eventName': 'ObjectCreated:Put', 'userIdentity': {'principalId': 'AWS:AIDAJDNB5MJJIJIUWHFYC'}, 'requestParameters': {'sourceIPAddress': '75.11.10.172'}, 'responseElements': {'x-amz-request-id': 'XZ9FYXXPQA300ZHF', 'x-amz-id-2': 'G6oY+FgKzEyaEo0DqkFxgkXNGPBFFbH/S76VeuZc91tsRkfzlaBiIXJir3dfwqSKYduwjXzNV2FvHE9zsj2+P5MNkvPj3e97'}, 's3': {'s3SchemaVersion': '1.0', 'configurationId': 'tf-s3-lambda-20241224032918392100000001', 'bucket': {'name': 'aseaman-protected', 'ownerIdentity': {'principalId': 'A3QM71HR4ZP65N'}, 'arn': 'arn:aws:s3:::aseaman-protected'}, 'object': {'key': 'budget/uploads/local/andrew/7c6674de8fb649b5b48229394a0edc7b', 'size': 460631, 'eTag': 'b4c75235a49b37f9d39254cc33c39d8c', 'sequencer': '00676A2F77261D51E6'}}}]}
# lambda_handler(event, {})
