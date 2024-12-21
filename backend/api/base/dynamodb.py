from .helpers import (
    get_expression_id,
    get_timestamp,
)


class DynamoDBNotFoundException(Exception):
    pass


class DynamoDBItemValueConfig:
    def __init__(self, data_type, default=None, optional=False):
        self.data_type = data_type
        self.default = default
        self.optional = optional


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

    def to_dict(self):
        return self._item

    def to_ddb_item(self):
        ddb_item = {}
        for key, props in self._config.items():
            if self._item[key] is not None:
                ddb_item[key] = {props.data_type: self._item[key]}
        return ddb_item

    @classmethod
    def build_update_expression(cls, update, update_expressions):
        expression_items = []

        used_ids = set()

        if cls._timestamp_key:
            expr_id = get_expression_id(used_ids)

            expression_items = [f"SET #{expr_id} = :{expr_id}"]
            attribute_names = {
                f"#{expr_id}": cls._timestamp_key,
            }
            attribute_values = {f":{expr_id}": {"N": get_timestamp()}}

        for key, props in cls._config.items():
            value = update.get(key, None)
            if value is not None:
                expr_id = get_expression_id(used_ids)
                expression_items.append(
                    update_expressions.get(key, f"#{expr_id} = :{expr_id}")
                )
                attribute_names[f"#{expr_id}"] = key
                attribute_values[f":{expr_id}"] = {props.data_type: update[key]}
        print(expression_items)
        return (
            f"SET {', '.join(expression_items)}",
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


class DynamoDBTable:
    ItemClass = None

    def __init__(self, table_name, ddb_client):
        self.table_name = table_name
        self.ddb_client = ddb_client

    def get(self, *args, **kwargs):
        ddb_item = self.ddb_client.get_item(
            TableName=self.table_name, Key=self.ItemClass.build_ddb_key(**kwargs)
        )
        if "Item" not in ddb_item:
            raise DynamoDBNotFoundException

        raw_item = ddb_item["Item"]
        return self.ItemClass.from_ddb_item(raw_item)

    def put(self, item):
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=item.to_ddb_item(),
        )

    def update(self, key, update_dict, update_expressions=None):
        (
            update_expression,
            expression_attribute_names,
            expression_attribute_values,
        ) = self.ItemClass.build_update_expression(update_dict, update_expressions)

        ddb_item = self.ddb_client.update_item(
            TableName=self.table_name,
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW",
        )["Attributes"]

        return self.ItemClass.from_ddb_item(ddb_item)

    def scan(self, scan_dict, operator="AND"):
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
