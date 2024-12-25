import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.aws import AWSConfig, DynamoDBConfig, DynamoDBTableConfig
from base.dynamodb import SaltLevelTable


class SaltLevelLambdaHandler(APILambdaHandlerBase):
    primary_partition_key = "water_softener_id"

    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[
                DynamoDBTableConfig("salt_level", SaltLevelTable),
            ],
        )
    )

    def _scan_all(self):
        return self.aws.dynamodb.tables["salt_level"].scan()

    def _scan_by_water_softener_id(self, water_softener_id):
        scan_dict = {"water_softener_id": water_softener_id}
        return self.aws.dynamodb.tables["salt_level"].scan(scan_dict)

    def handle_get(self):
        water_softener_id = self.params.get("water_softener_id")
        if water_softener_id:
            items = self._scan_by_water_softener_id(water_softener_id)
        else:
            items = self._scan_all()

        items = [item.to_dict() for item in items]
        return {
            **self._empty_response(),
            "body": json.dumps(items),
        }


def lambda_handler(event, context):
    return SaltLevelLambdaHandler(event, context).handle()
