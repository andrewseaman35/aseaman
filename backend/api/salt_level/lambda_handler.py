import json
import time

from base.lambda_handler_base import APILambdaHandlerBase

TABLE_NAME = "salt_level"
LOCAL_TABLE_NAME = "salt_level_local"


class SaltLevelLambdaHandler(APILambdaHandlerBase):
    require_auth = False

    primary_partition_key = "water_softener_id"

    def _init(self):
        self.table_name = LOCAL_TABLE_NAME if self.is_local else TABLE_NAME

    def _init_aws(self):
        self.ddb_client = self.aws_session.client("dynamodb", region_name="us-east-1")

    def _scan_all(self):
        return self.ddb_client.scan(
            TableName=self.table_name,
        )["Items"]

    def _scan_by_water_softener_id(self, water_softener_id):
        return self.ddb_client.scan(
            TableName=self.table_name,
            ExpressionAttributeNames={
                "#wsid": "water_softener_id",
            },
            ExpressionAttributeValues={
                ":wsid": {
                    "S": water_softener_id,
                },
            },
            FilterExpression="#wsid = :wsid",
        )["Items"]

    def handle_get(self):
        water_softener_id = self.params.get("water_softener_id")
        if water_softener_id:
            ddb_items = self._scan_by_water_softener_id(water_softener_id)
        else:
            ddb_items = self._scan_all()

        items = [self._ddb_item_to_json(ddb_item) for ddb_item in ddb_items]
        return {
            **self._empty_response(),
            "body": json.dumps(items),
        }


def lambda_handler(event, context):
    return SaltLevelLambdaHandler(event, context).handle()
