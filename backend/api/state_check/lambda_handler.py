import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import BadRequestException

TABLE_NAME = "states"


class StateCheckAPILambdaHandler(APILambdaHandlerBase):
    def _init_aws(self):
        self.ddb_client = self.aws_session.client("dynamodb", region_name="us-east-1")

    def _get_state_data(self, state_id):
        common_keys = {"id", "time_updated"}
        ddb_item = self.ddb_client.get_item(
            TableName=TABLE_NAME,
            Key={
                "id": {
                    "S": state_id,
                }
            },
        )["Item"]

        result = {key: ddb_item.pop(key)["S"] for key in common_keys}

        result["data"] = self._ddb_item_to_json(ddb_item)
        return result

    def handle_get(self):
        state_id = self.params.get("state_id")
        if not state_id:
            raise BadRequestException("state_id required")
        result = self._get_state_data(state_id)
        return {
            **self._empty_response(),
            "body": json.dumps(result),
        }


def lambda_handler(event, context):
    return StateCheckAPILambdaHandler(event, context).handle()
