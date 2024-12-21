from dataclasses import dataclass

from base.dynamodb import DynamoDBTable


@dataclass
class DynamoDBTableConfig:
    name: str
    TableClass: DynamoDBTable


@dataclass
class DynamoDBConfig:
    enabled: bool
    tables: list[DynamoDBTableConfig]


@dataclass
class AWSConfig:
    dynamodb: DynamoDBConfig
