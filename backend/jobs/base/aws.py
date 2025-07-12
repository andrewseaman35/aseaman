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
    dynamodb: DynamoDBConfig
    s3: S3Config
    ssm: SSMConfig

    def __init__(self, **kwargs: Any) -> None:
        self.dynamodb = kwargs.get("dynamodb", DynamoDBConfig())
        self.s3 = kwargs.get("s3", S3Config())
        self.ssm = kwargs.get("ssm", SSMConfig())


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
    dynamodb: DynamoDB
    s3: S3
    ssm: SSM
