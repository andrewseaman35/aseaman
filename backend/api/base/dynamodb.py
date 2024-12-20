from .helpers import generate_id, generate_alphanumeric_id


class DynamoDBItemValueConfig:
    data_type = None
    default = None

    def __init__(self, data_type, default):
        self.data_type = data_type
        self.default = default


class DynamoDBItem:
    timestamp_key = "time_updated"
    _config = {
        "id": DynamoDBItemValueConfig("S", generate_id),
        "url": DynamoDBItemValueConfig("S", ""),
        "name": DynamoDBItemValueConfig("S", generate_alphanumeric_id),
        "active": DynamoDBItemValueConfig("BOOL", False),
        "locked": DynamoDBItemValueConfig("BOOL", False),
    }

    def __init__(self, item):
        self._item = item

    def __repr__(self):
        return self._item.__repr__()

    def __getitem__(self, key):
        if key not in self._item:
            return None
        return self._item[key]

    @classmethod
    def from_dict(cls, _dict):
        _item = {}
        for key, props in cls._config.items():
            if key not in _dict:
                if props.default is None:
                    raise Exception(f"No default value specified for {key}")
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
            # if key not in ddb_item:
            #     value = None
            value = ddb_item[key][props.data_type]
            _item[key] = value

        return cls(_item)

    def to_dict(self):
        return self._item

    def to_ddb_item(self):
        ddb_item = {}
        for key, props in self._config.items():
            ddb_item[key] = {props.data_type: self._item[key]}

        return ddb_item
