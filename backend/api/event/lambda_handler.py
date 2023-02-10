import os
import json
import sys
import time

# Required to support absolute imports when running locally and on lambda
CURR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURR_DIR)

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
)


class EventHandler(APILambdaHandlerBase):
    @property
    def HANDLERS_BY_TYPE(self):
        return {"track": self.handle_track_event}

    @property
    def table_name(self):
        if self.env == "live":
            return "event"
        return f"event_stage"

    def _init_aws(self):
        self.ddb_client = self.aws_session.client("dynamodb", region_name="us-east-1")

    def _get_timestamp(self):
        return str(int(time.time()))

    def _format_ddb_item(self, ddbItem):
        return {
            "event_id": ddbItem["event_id"]["S"],
            "count": ddbItem["count"]["N"],
            "time_created": ddbItem["time_created"]["N"],
            "time_updated": ddbItem["time_updated"]["N"],
        }

    def _build_new_event_ddb_item(self, event_id):
        timestamp = self._get_timestamp()
        item = {
            "event_id": {
                "S": event_id,
            },
            "count": {
                "N": "1",
            },
            "time_created": {
                "N": timestamp,
            },
            "time_updated": {
                "N": timestamp,
            },
        }
        return item

    def _build_update_expression_parameters(self):
        expression_items = ["SET #tu = :tu", "#co = #co + :c"]
        attribute_names = {
            "#tu": "time_updated",
            "#co": "count",
        }
        attribute_values = {
            ":tu": {"N": self._get_timestamp()},
            ":c": {"N": "1"},
        }

        return (
            ", ".join(expression_items),
            attribute_names,
            attribute_values,
        )

    def _update_event(self, event_id):
        print(f"Updating event {event_id}")
        (
            update_expression,
            expression_attribute_names,
            expression_attribute_values,
        ) = self._build_update_expression_parameters()
        ddbItem = self.ddb_client.update_item(
            TableName=self.table_name,
            Key={"event_id": {"S": event_id}},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW",
        )["Attributes"]
        return self._format_ddb_item(ddbItem)

    def __fetch_event(self, event_id):
        ddbItem = self.ddb_client.get_item(
            TableName=self.table_name,
            Key={
                "event_id": {
                    "S": event_id,
                },
            },
        )
        if "Item" not in ddbItem:
            return None

        ddbItem = ddbItem["Item"]

        return self._format_ddb_item(ddbItem)

    def __create_event(self, event_id):
        ddb_item = self._build_new_event_ddb_item(event_id)
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=ddb_item,
        )
        return self._format_ddb_item(ddb_item)

    def handle_track_event(self, event_id, event):
        if event is None:
            return self.__create_event(event_id)

        return self._update_event(event_id)

    def handle_get(self):
        path_parts = self.event["path"].strip("/").split("/")
        resource = path_parts[1] if len(path_parts) > 1 else None

        if resource not in self.HANDLERS_BY_TYPE:
            raise NotFoundException("event type not supported")

        event_id = self.params.get("event_id")
        if not event_id:
            raise BadRequestException("missing event_id")

        event = self.__fetch_event(event_id)
        result = self.HANDLERS_BY_TYPE[resource](event_id, event)

        response = self._empty_response()

        return {
            **response,
            "body": json.dumps(result),
        }


def lambda_handler(event, context):
    return EventHandler(event, context).handle()
