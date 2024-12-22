from dataclasses import dataclass
from typing import Any

from base.dynamodb import DynamoDBTable


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


@dataclass
class S3Config:
    enabled: bool = False
    buckets: dict[str, S3BucketConfig] = dict


@dataclass
class AWSConfig:
    dynamodb: DynamoDBConfig = DynamoDBConfig()
    s3: S3Config = S3Config()


@dataclass
class DynamoDB:
    client: Any = None
    tables: dict = dict


@dataclass
class S3:
    client: Any = None
    buckets: dict = dict


@dataclass
class AWS:
    dynamodb: DynamoDB = DynamoDB()
    s3: Any = S3()
