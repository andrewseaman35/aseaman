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
)
from base.dynamodb import DynamoDBItem, DynamoDBItemValueConfig, DynamoDBTable
from base.helpers import get_timestamp


class EventDDBItem(DynamoDBItem):
    _config = {
        "event_id": DynamoDBItemValueConfig("S"),
        "count": DynamoDBItemValueConfig("N", "0"),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None),
    }

    @classmethod
    def build_ddb_key(cls, *args, event_id=None):
        assert event_id is not None, "event_id required to build ddb key"
        return {
            "event_id": {
                "S": event_id,
            },
        }


class EventTable(DynamoDBTable):
    ItemClass = EventDDBItem


class EventHandler(APILambdaHandlerBase):
    aws_config = {
        "dynamodb": {
            "enabled": True,
            "tables": [("event", EventTable)],
        }
    }

    @property
    def HANDLERS_BY_TYPE(self):
        return {"track": self.handle_track_event}

    def _update_event(self, event_id):
        print(f"Updating event {event_id}")
        update_dict = {
            "count": {
                "value": "1",
                "operation": "ADD",
            }
        }
        event = self.aws.dynamodb.tables["event"].update(
            EventDDBItem.build_ddb_key(event_id=event_id),
            update_dict,
        )

        return event.to_dict()

    def __fetch_event(self, event_id):
        event = self.aws.dynamodb.tables["event"].get(event_id=event_id)
        return event.to_dict()

    def __create_event(self, event_id):
        timestamp = get_timestamp()
        event = EventDDBItem.from_dict(
            {
                "event_id": event_id,
                "time_created": timestamp,
                "time_updated": timestamp,
            }
        )
        self.aws.dynamodb.tables["event"].put(event)

        return event.to_dict()

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
