import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.dynamodb import DynamoDBItem, DynamoDBItemValueConfig, DynamoDBTable


class SaltLevelDDBItem(DynamoDBItem):
    _config = {
        "water_softener_id": DynamoDBItemValueConfig(
            "S",
        ),
        "timestamp": DynamoDBItemValueConfig("N"),
        "sensor_0": DynamoDBItemValueConfig("N"),
        "sensor_1": DynamoDBItemValueConfig("N"),
        "sensor_2": DynamoDBItemValueConfig("N"),
        "sensor_3": DynamoDBItemValueConfig("N"),
    }


class SaltLevelTable(DynamoDBTable):
    ItemClass = SaltLevelDDBItem


class SaltLevelLambdaHandler(APILambdaHandlerBase):
    primary_partition_key = "water_softener_id"

    aws_config = {
        "dynamodb": {"enabled": True, "tables": [("salt_level", SaltLevelTable)]}
    }

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
