from dataclasses import dataclass
from typing import Any, Callable, Union

from base.dynamodb import DynamoDBTable
from base.s3 import S3Bucket


@dataclass
class DynamoDBTableConfig:
    name: str
    TableClass: DynamoDBTable


@dataclass
class DynamoDBConfig:
    enabled: bool = False
    tables: list[DynamoDBTableConfig] = list


@dataclass
class S3BucketConfig:
    name: str
    bucket_name: str
    prefix: Union[str, Callable] = ""


@dataclass
class S3Config:
    enabled: bool = False
    buckets: list[S3BucketConfig] = list


@dataclass
class SSMConfig:
    enabled: bool = True


@dataclass
class AWSConfig:
    dynamodb: DynamoDBConfig = DynamoDBConfig()
    s3: S3Config = S3Config()
    ssm: SSMConfig = SSMConfig()


@dataclass
class DynamoDB:
    client: Any = None
    tables: dict[str, DynamoDBTable] = dict


@dataclass
class S3:
    client: Any = None
    buckets: dict[str, S3Bucket] = dict


@dataclass
class SSM:
    client: Any = None


@dataclass
class AWS:
    dynamodb: DynamoDB = DynamoDB()
    s3: Any = S3()
    ssm: SSM = SSM()
