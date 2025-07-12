import datetime
import hashlib
import json

from .helpers import (
    CHESS_VERSION,
    LINK_ID_LENGTH,
    generate_chess_game_id,
    generate_alphanumeric_id,
    chunk,
    generate_id,
    get_expression_id,
    get_timestamp,
)


class DynamoDBNotFoundException(Exception):
    pass


class DynamoDBUnauthorizedException(Exception):
    pass


class DynamoDBItemValueConfig:
    def __init__(
        self,
        data_type: str,
        default=None,
        optional: bool = False,
        internal: bool = False,
    ):
        self.data_type = data_type
        self.default = default
        self.optional = optional
        self.internal = internal


class DynamoDBItem:
    _timestamp_key = "time_updated"
    _config = None

    def __init__(self, item):
        self._item = item

    def __repr__(self):
        return self._item.__repr__()

    def __getitem__(self, key):
        if key not in self._item:
            return None
        return self._item[key]

    def __getattr__(self, key):
        return self[key]

    def __getstate__(self):
        return self.__dict__

    def __setstate__(self, d):
        self.__dict__.update(d)

    def config(self, config_key):
        return self._config[config_key]

    @property
    def ddb_key(self):
        return self.build_ddb_key(id=self.id)

    def build_ddb_key(self, *args, **kwargs):
        return NotImplemented

    @classmethod
    def from_dict(cls, _dict):
        _item = {}
        for key, props in cls._config.items():
            if key not in _dict:
                if callable(props.default):
                    value = props.default()
                else:
                    value = props.default
            else:
                value = _dict[key]
            _item[key] = value

        return cls(_item)

    @classmethod
    def from_ddb_item(cls, ddb_item):
        _item = {}
        for key, props in cls._config.items():
            if key not in ddb_item:
                if not props.optional:
                    raise ValueError(f"missing key: {key}")
                value = None
            else:
                value = ddb_item[key][props.data_type]
            _item[key] = value

        return cls(_item)

    def serialize(self):
        _dict = self.to_dict()
        for key, props in self._config.items():
            if props.internal:
                del _dict[key]
        return json.dumps(self.to_dict(include_internal=False))

    def to_dict(self, include_internal=True):
        _dict = {**self._item}
        if include_internal:
            return _dict
        for key, props in self._config.items():
            if props.internal and key in _dict:
                del _dict[key]
        return _dict

    def to_ddb_item(self):
        ddb_item = {}
        for key, props in self._config.items():
            if self._item[key] not in [None, ""]:
                if props.data_type == "BOOL":
                    ddb_item[key] = {props.data_type: bool(self._item[key])}
                elif props.data_type == "L":
                    ddb_item[key] = {props.data_type: list(self._item[key])}
                else:
                    ddb_item[key] = {props.data_type: str(self._item[key])}
        return ddb_item

    def validate_ownership(self, *args, **kwargs):
        raise NotImplementedError

    @classmethod
    def build_update_expression(cls, update_dict):
        used_ids = set()

        attribute_names = {}
        attribute_values = {}
        expression_add_items = []
        expression_set_items = []
        expression_items = []
        if cls._timestamp_key:
            expr_id = get_expression_id(used_ids)

            expression_set_items.append(f"#{expr_id} = :{expr_id}")
            attribute_names = {
                f"#{expr_id}": cls._timestamp_key,
            }
            attribute_values = {f":{expr_id}": {"N": get_timestamp()}}

        for key, props in cls._config.items():
            value = update_dict.get(key, None)
            if value is not None:
                expr_id = get_expression_id(used_ids)
                if value["operation"] == "SET":
                    expression_set_items.append(f"#{expr_id} = :{expr_id}")
                elif value["operation"] == "ADD":
                    expression_add_items.append(f"{key} :{expr_id}")
                elif value["operation"] == "list_append":
                    expression_items.append(
                        f"{key} = list_append(#{expr_id}, :{expr_id})"
                    )
                else:
                    raise Exception(f"unknown operation {key}")

                if value["operation"] != "ADD":
                    attribute_names[f"#{expr_id}"] = key
                attribute_values[f":{expr_id}"] = {props.data_type: value["value"]}

        if expression_set_items:
            expression_items.insert(0, f"SET {', '.join(expression_set_items)}")
        if expression_add_items:
            expression_items.insert(0, f"ADD {', '.join(expression_add_items)}")

        return (
            ", ".join(expression_items),
            attribute_names,
            attribute_values,
        )

    @classmethod
    def build_scan_attributes(cls, attributes, operator="AND"):
        attribute_names = {}
        attribute_values = {}
        filter_expression_items = []

        used_expr_ids = set()
        for key, value in attributes.items():
            if key not in cls._config:
                raise ValueError(f"{key} not found in config")

            props = cls._config[key]
            expr_id = get_expression_id(used_expr_ids)
            attribute_names[f"#{expr_id}"] = key
            attribute_values[f":{expr_id}"] = {props.data_type: value}
            filter_expression_items.append(f"(#{expr_id} = :{expr_id})")

        return (
            attribute_names,
            attribute_values,
            f" {operator} ".join(filter_expression_items),
        )

    @classmethod
    def build_query_attributes(cls, key_dict, attributes):
        k = list(key_dict.keys())[0]
        expr_id = get_expression_id(set())
        key_condition_expression = f"#{expr_id} = :{expr_id}"
        expression_attribute_values = {
            f":{expr_id}": {cls._config[k].data_type: key_dict[k]}
        }
        expression_attribute_names = {f"#{expr_id}": k}
        filter_expression = []

        for key, value in attributes.items():
            expr_id = get_expression_id(set())
            expression_attribute_names[f"#{expr_id}"] = key
            expression_attribute_values[f":{expr_id}"] = {
                cls._config[key].data_type: value
            }
            filter_expression.append(f"#{expr_id} = :{expr_id}")

        return (
            key_condition_expression,
            expression_attribute_names,
            expression_attribute_values,
            " and ".join(filter_expression),
        )


class DynamoDBTable:
    ItemClass = None
    validate_owner = True

    def __init__(self, table_name: str, ddb_client, user=None) -> None:
        self.table_name = table_name
        self.ddb_client = ddb_client
        self.user = user

    def get(self, *args, quiet=False, **kwargs):
        if self.validate_owner and not self.user:
            raise DynamoDBUnauthorizedException

        ddb_item = self.ddb_client.get_item(
            TableName=self.table_name, Key=self.ItemClass.build_ddb_key(**kwargs)
        )
        if "Item" not in ddb_item:
            if quiet:
                return None
            raise DynamoDBNotFoundException

        raw_item = ddb_item["Item"]
        item = self.ItemClass.from_ddb_item(raw_item)

        if self.validate_owner:
            item.validate_ownership(self.user)

        return item

    def batch_get(self, request_keys):
        result = self.ddb_client.batch_get_item(
            RequestItems={self.summary_table_name: {"Keys": request_keys}}
        )

        ddb_items = result.get("Responses", {}).get(self.summary_table_name, [])
        return [self.ItemClass.from_ddb_item(ddb_item) for ddb_item in ddb_items]

    def put(self, item):
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=item.to_ddb_item(),
        )

    def bulk_put(self, items):
        put_requests = [{"PutRequest": {"Item": item.to_ddb_item()}} for item in items]
        for batch in chunk(put_requests, 25):
            self.ddb_client.batch_write_item(
                RequestItems={
                    self.table_name: batch,
                }
            )
        return items

    def update(self, key, update_dict):
        (
            update_expression,
            expression_attribute_names,
            expression_attribute_values,
        ) = self.ItemClass.build_update_expression(update_dict)

        update_kwargs = {
            "TableName": self.table_name,
            "Key": key,
            "ReturnValues": "ALL_NEW",
        }
        if update_expression:
            update_kwargs["UpdateExpression"] = update_expression
        if expression_attribute_names:
            update_kwargs["ExpressionAttributeNames"] = expression_attribute_names
        if expression_attribute_values:
            update_kwargs["ExpressionAttributeValues"] = expression_attribute_values

        ddb_item = self.ddb_client.update_item(**update_kwargs)["Attributes"]

        return self.ItemClass.from_ddb_item(ddb_item)

    def scan(self, scan_dict=None, operator="AND"):
        if scan_dict is None:
            ddb_items = self.ddb_client.scan(TableName=self.table_name)["Items"]
        else:
            (
                expression_attribute_names,
                expression_attribute_values,
                filter_expression,
            ) = self.ItemClass.build_scan_attributes(scan_dict, operator=operator)

            ddb_items = self.ddb_client.scan(
                TableName=self.table_name,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values,
                FilterExpression=filter_expression,
            )["Items"]

        return [self.ItemClass.from_ddb_item(ddb_item) for ddb_item in ddb_items]

    def delete(self, key):
        self.ddb_client.delete_item(
            TableName=self.table_name,
            Key=key,
        )

    def query(self, key, query_dict=None):
        (
            key_condition_expression,
            expression_attribute_names,
            expression_attribute_values,
            filter_expression,
        ) = self.ItemClass.build_query_attributes(key, query_dict)

        result = self.ddb_client.query(
            TableName=self.table_name,
            Select="ALL_ATTRIBUTES",
            ConsistentRead=False,
            KeyConditionExpression=key_condition_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
            FilterExpression=filter_expression,
        )
        ddb_items = result.get("Items", [])
        return [self.ItemClass.from_ddb_item(ddb_item) for ddb_item in ddb_items]


class BudgetFileDDBItem(DynamoDBItem):
    _config = {
        "owner": DynamoDBItemValueConfig("S"),
        "id": DynamoDBItemValueConfig("S", default=generate_id),
        "state": DynamoDBItemValueConfig("S"),
        "s3_key": DynamoDBItemValueConfig("S", internal=True),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None),
    }

    @property
    def ddb_key(self):
        return self.build_ddb_key(owner=self.owner, s3_key=self.s3_key)

    @classmethod
    def build_ddb_key(cls, *args, owner=None, s3_key=None, **kwargs):
        assert owner is not None, "owner required to build ddb key"
        assert s3_key is not None, "s3_key required to build ddb key"
        return {
            "owner": {
                "S": owner,
            },
            "s3_key": {"S": s3_key},
        }

    def validate_ownership(self, user=None):
        if user is None:
            raise DynamoDBUnauthorizedException("not logged in")

        owner_username = self.owner
        if not user["username"] or user["username"] != owner_username:
            raise DynamoDBUnauthorizedException("Budget file not owned")


class BudgetFileTable(DynamoDBTable):
    ItemClass = BudgetFileDDBItem


class BudgetFileEntryDDBItem(DynamoDBItem):
    _timestamp_key = "time_processed"
    _config = {
        "owner": DynamoDBItemValueConfig("S"),
        "id": DynamoDBItemValueConfig("S"),
        "transaction_date": DynamoDBItemValueConfig("S", default=None, optional=True),
        "transaction_month": DynamoDBItemValueConfig("N", default=None, optional=True),
        "transaction_year": DynamoDBItemValueConfig("N", default=None, optional=True),
        "post_date": DynamoDBItemValueConfig("S"),
        "description": DynamoDBItemValueConfig("S", default=None),
        "original_category": DynamoDBItemValueConfig("S", default=None, optional=True),
        "category": DynamoDBItemValueConfig("S", default=None, optional=True),
        "transaction_type": DynamoDBItemValueConfig("S", default=None, optional=True),
        "amount": DynamoDBItemValueConfig("N"),
        "time_processed": DynamoDBItemValueConfig("N", default=None, optional=True),
        "source": DynamoDBItemValueConfig("S", default=None),
    }

    @classmethod
    def from_row(cls, row, owner, timestamp, source):
        return cls(
            {
                "owner": owner,
                "id": row.hash_,
                "transaction_date": row.transaction_date.strftime("%m/%d/%Y"),
                "transaction_month": str(row.transaction_date.month),
                "transaction_year": str(row.transaction_date.year),
                "post_date": row.post_date.strftime("%m/%d/%Y"),
                "description": row.description,
                "original_category": row.category,
                "category": row.category,
                "transaction_type": row.transaction_type,
                "amount": row.amount,
                "time_processed": timestamp,
                "source": source,
            }
        )


class BudgetFileEntryTable(DynamoDBTable):
    ItemClass = BudgetFileEntryDDBItem


class BudgetFileConfigDDBItem(DynamoDBItem):
    _config = {
        "owner": DynamoDBItemValueConfig("S"),
        "s3_key": DynamoDBItemValueConfig("S", internal=True),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None, optional=True),
    }

    @property
    def ddb_key(self):
        return self.build_ddb_key(owner=self.owner)

    @classmethod
    def build_ddb_key(cls, *args, owner=None, **kwargs):
        assert owner is not None, "owner required to build ddb key"
        return {
            "owner": {
                "S": owner,
            },
        }

    def validate_ownership(self, user=None):
        if user is None:
            raise DynamoDBUnauthorizedException("not logged in")

        owner_username = self.owner
        if not user["username"] or user["username"] != owner_username:
            raise DynamoDBUnauthorizedException("Budget file not owned")


class BudgetFileConfigTable(DynamoDBTable):
    ItemClass = BudgetFileConfigDDBItem
    validate_owner = True


class ChessGameDDBItem(DynamoDBItem):
    _config = {
        "game_id": DynamoDBItemValueConfig("S", default=generate_chess_game_id),
        "game_mode": DynamoDBItemValueConfig("S", default="local"),
        "turns": DynamoDBItemValueConfig("L", default=[], optional=True),
        "version": DynamoDBItemValueConfig("S", default=CHESS_VERSION),
        "player_one": DynamoDBItemValueConfig("S", default=None, optional=True),
        "player_two": DynamoDBItemValueConfig("S", default=None, optional=True),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N"),
    }

    @classmethod
    def build_ddb_key(cls, *args, game_id=None, **kwargs):
        assert game_id is not None, "game_id required to build ddb key"
        return {
            "game_id": {
                "S": game_id,
            }
        }

    def validate_ownership(self, user):
        players = {self.player_one, self.player_two}
        if all(players):
            if not user["username"] or not user["username"] in players:
                raise UnauthorizedException("Log in to access this game")


class ChessGameTable(DynamoDBTable):
    ItemClass = ChessGameDDBItem
    validate_owner = True


class CompareACNHSummaryItem(DynamoDBItem):
    _timestamp_key = None

    _config = {
        "villager_id": DynamoDBItemValueConfig("S"),
        "losses": DynamoDBItemValueConfig("N"),
        "wins": DynamoDBItemValueConfig("N"),
    }

    @classmethod
    def build_ddb_key(cls, *args, villager_id=None, **kwargs):
        assert villager_id is not None, "villager_id required to build ddb key"
        return {
            "villager_id": {
                "S": villager_id,
            }
        }


class CompareACNHResultsItem(DynamoDBItem):
    _timestamp_key = None

    _config = {
        "v_id": DynamoDBItemValueConfig("S"),
        "v_id2": DynamoDBItemValueConfig("S"),
        "losses": DynamoDBItemValueConfig("N"),
        "wins": DynamoDBItemValueConfig("N"),
    }

    @classmethod
    def build_ddb_key(cls, *args, villager_id=None, villager_id_2=None, **kwargs):
        assert villager_id is not None, "villager_id required to build ddb key"
        assert villager_id_2 is not None, "villager_id_2 required to build ddb key"
        return {
            "v_id": {
                "S": villager_id,
            },
            "v_id2": {
                "S": villager_id_2,
            },
        }


class CompareACNHSummaryTable(DynamoDBTable):
    ItemClass = CompareACNHSummaryItem


class CompareACNHResultsTable(DynamoDBTable):
    ItemClass = CompareACNHResultsItem


class EventDDBItem(DynamoDBItem):
    _config = {
        "event_id": DynamoDBItemValueConfig("S"),
        "count": DynamoDBItemValueConfig("N", "0"),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None),
    }

    @classmethod
    def build_ddb_key(cls, *args, event_id=None, **kwargs):
        assert event_id is not None, "event_id required to build ddb key"
        return {
            "event_id": {
                "S": event_id,
            },
        }


class EventTable(DynamoDBTable):
    ItemClass = EventDDBItem


class LinkDDBItem(DynamoDBItem):
    _config = {
        "id": DynamoDBItemValueConfig(
            "S", default=lambda: generate_alphanumeric_id(LINK_ID_LENGTH)
        ),
        "url": DynamoDBItemValueConfig("S", default=None, optional=True),
        "active": DynamoDBItemValueConfig("BOOL", default=False, optional=True),
        "locked": DynamoDBItemValueConfig("BOOL", default=False, optional=True),
        "owner": DynamoDBItemValueConfig("S"),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None),
    }

    @classmethod
    def build_ddb_key(cls, *args, id=None, **kwargs):
        assert id is not None, "id required to build ddb key"
        return {
            "id": {
                "S": id,
            }
        }

    def validate_ownership(self, user=None):
        if user is None:
            raise UnauthorizedException("not logged in")

        owner_username = self.owner
        if not user["username"] or user["username"] != owner_username:
            raise UnauthorizedException("Link not owned")


class LinkTable(DynamoDBTable):
    ItemClass = LinkDDBItem


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


class WSConnectionDDBItem(DynamoDBItem):
    _config = {
        "connection_id": DynamoDBItemValueConfig("S"),
        "room_id": DynamoDBItemValueConfig("S"),
        "username": DynamoDBItemValueConfig("S"),
        "time_created": DynamoDBItemValueConfig("N", default=get_timestamp),
        "time_updated": DynamoDBItemValueConfig("N", default=None, optional=True),
    }

    @classmethod
    def build_ddb_key(
        cls, *args, connection_id=None, room_id=None, **kwargs
    ) -> dict[str, dict[str, str]]:
        assert connection_id is not None, "connection_id required to build ddb key"
        assert room_id is not None, "room_id required to build ddb key"
        return {
            "connection_id": {
                "S": connection_id,
            },
            "room_id": {
                "S": room_id,
            },
        }


class WSConnectionTable(DynamoDBTable):
    ItemClass = WSConnectionDDBItem
    validate_owner = False
