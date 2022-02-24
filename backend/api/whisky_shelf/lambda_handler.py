import json

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import BadRequestException

TABLE_NAME = "whisky"
LOCAL_TABLE_NAME = "whisky_local"


class WhiskyShelfLambdaHandler(APILambdaHandlerBase):
    def _init(self):
        self.table_name = LOCAL_TABLE_NAME if self.is_local else TABLE_NAME

    def _init_aws(self):
        self.ddb_client = self.aws_session.client("dynamodb", region_name="us-east-1")

    def _get_item(self, distillery, name):
        result = self.ddb_client.get_item(
            TableName=self.table_name,
            Key={
                "distillery": {
                    "S": distillery,
                },
                "name": {
                    "S": name,
                },
            },
        )

        return result.get("Item")

    def _update_item(self, distillery, name, current):
        expression_attribute_names = {
            "#cur": "current",
        }
        expression_attribute_values = {":cur": {"BOOL": current}}
        set_update_expression_list = ["#cur = :cur"]
        delete_update_expression_list = []

        def _add_to_request_params(key):
            val = self.params.get(key)
            if val is not None:
                name = "#{}".format(key)
                value = ":{}".format(key)
                expression_attribute_names[name] = key
                if val:
                    expression_attribute_values[value] = {"S": val}
                    set_update_expression_list.append("{} = {}".format(name, value))
                else:
                    delete_update_expression_list.append(name)

        _add_to_request_params("type")
        _add_to_request_params("region")
        _add_to_request_params("country")
        _add_to_request_params("style")

        update_expression = "SET {}".format(", ".join(set_update_expression_list))
        if delete_update_expression_list:
            update_expression += " REMOVE {}".format(
                ", ".join(delete_update_expression_list)
            )

        return self.ddb_client.update_item(
            TableName=self.table_name,
            Key={
                "distillery": {
                    "S": distillery,
                },
                "name": {
                    "S": name,
                },
            },
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            UpdateExpression=update_expression,
            ReturnValues="ALL_NEW",
        )["Attributes"]

    def handle_get(self):
        ddb_items = self.ddb_client.scan(
            TableName=self.table_name,
            ExpressionAttributeNames={
                "#cur": "current",
            },
            ExpressionAttributeValues={":true": {"BOOL": True}},
            FilterExpression="#cur = :true",
        )["Items"]

        items = [self._ddb_item_to_json(ddb_item) for ddb_item in ddb_items]
        return {
            **self._empty_response(),
            "body": json.dumps(items),
        }

    def handle_post(self):
        distillery = self.params.get("distillery")
        name = self.params.get("name")
        if not distillery or not name:
            raise BadRequestException("distillery and name required")

        item = self._get_item(distillery, name)
        if item is None:
            print(
                "Adding new item to shelf: {} {}".format(
                    distillery,
                    name,
                )
            )
            ddbItem = {
                "distillery": {
                    "S": distillery,
                },
                "name": {
                    "S": name,
                },
                "current": {
                    "BOOL": True,
                },
            }

            result = {
                "distillery": distillery,
                "name": name,
                "current": True,
            }

            def _add_to_ddb_item(key, type_key="S"):
                val = self.params.get(key)
                if val:
                    ddbItem[key] = {type_key: val}
                    result[key] = val

            _add_to_ddb_item("type")
            _add_to_ddb_item("region")
            _add_to_ddb_item("country")
            _add_to_ddb_item("style")
            _add_to_ddb_item("age", "N")

            item = self.ddb_client.put_item(
                TableName=self.table_name,
                Item=ddbItem,
                ReturnValues="ALL_OLD",
            )
        else:
            updated_item = self._update_item(distillery, name, True)
            result = {
                "distillery": updated_item["distillery"]["S"],
                "name": updated_item["name"]["S"],
                "current": updated_item.get("current", {}).get("BOOL"),
                "type": updated_item.get("type", {}).get("S"),
                "region": updated_item.get("region", {}).get("S"),
                "country": updated_item.get("country", {}).get("S"),
                "style": updated_item.get("style", {}).get("S"),
                "age": updated_item.get("age", {}).get("N"),
            }

        return {
            **self._empty_response(),
            "body": json.dumps(result),
        }


def lambda_handler(event, context):
    return WhiskyShelfLambdaHandler(event, context).handle()
