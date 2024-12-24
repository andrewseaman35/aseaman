import json

from .helpers import (
    chunk,
    get_expression_id,
    get_timestamp,
)


class DynamoDBNotFoundException(Exception):
    pass


class DynamoDBUnauthorizedException(Exception):
    pass


class DynamoDBItemValueConfig:
    def __init__(self, data_type, default=None, optional=False, internal=False):
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
        return json.dumps(self.to_dict())

    def to_dict(self):
        return self._item

    def to_ddb_item(self):
        ddb_item = {}
        for key, props in self._config.items():
            if self._item[key] not in {None, ""}:
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
    def build_query_attributes(cls, attributes):
        attribute_keys = list(attributes.keys())
        assert len(attribute_keys) == 1, "only one query attribute key supported"

        expr_id = get_expression_id(set())
        key = attribute_keys[0]
        key_condition_expression = f"{key} = :{expr_id}"
        expression_attribute_values = {
            f":{expr_id}": {cls._config[key].data_type: attributes[key]}
        }
        return (key_condition_expression, expression_attribute_values)


class DynamoDBTable:
    ItemClass = None
    validate_owner = True

    def __init__(self, table_name, ddb_client):
        self.table_name = table_name
        self.ddb_client = ddb_client

    def get(self, *args, **kwargs):
        if self.validate_owner and not kwargs["user"]:
            raise DynamoDBUnauthorizedException

        ddb_item = self.ddb_client.get_item(
            TableName=self.table_name, Key=self.ItemClass.build_ddb_key(**kwargs)
        )
        if "Item" not in ddb_item:
            raise DynamoDBNotFoundException

        raw_item = ddb_item["Item"]
        item = self.ItemClass.from_ddb_item(raw_item)

        if self.validate_owner:
            item.validate_ownership(kwargs["user"])

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

    def query(self, query_dict=None):
        (
            key_condition_expression,
            expression_attribute_values,
        ) = self.ItemClass.build_query_attributes(query_dict)

        result = self.ddb_client.query(
            TableName=self.table_name,
            Select="ALL_ATTRIBUTES",
            ConsistentRead=False,
            KeyConditionExpression=key_condition_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )
        ddb_items = result.get("Items", [])
        return [self.ItemClass.from_ddb_item(ddb_item) for ddb_item in ddb_items]
