from dataclasses import dataclass

from base.dynamodb import DynamoDBTable


@dataclass
class DynamoDBTableConfig:
    name: str
    TableClass: DynamoDBTable


@dataclass
class DynamoDBConfig:
    enabled: bool = False
    tables: list[DynamoDBTableConfig]


@dataclass
class S3BucketConfig:
    name: str


@dataclass
class S3Config:
    enabled: bool = False
    buckets: dict[str, S3BucketConfig]


@dataclass
class AWSConfig:
    dynamodb: DynamoDBConfig
    s3: S3Config
