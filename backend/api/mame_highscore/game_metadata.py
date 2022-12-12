import json
import os


GAME_METADATA_FILE = os.path.join(os.path.dirname(__file__), "game_metadata.json")


def load_game_metadata():
    parser_config = json.load(open(GAME_METADATA_FILE, "r"))
    return parser_config


class GameMetadataItem:
    def __init__(self, obj):
        self.data = obj

    @property
    def title(self):
        return self.data["title"]

    def serialize(self):
        return {"title": self.title}


class GameMetadata(dict):
    def __init__(self):
        data = load_game_metadata()
        for k, v in data.items():
            self.__dict__[k] = GameMetadataItem(v)

    def __setitem__(self, key, item):
        self.__dict__[key] = item

    def __getitem__(self, key):
        return self.__dict__[key]

    def __contains__(self, key):
        return key in self.__dict__


GAME_METADATA = GameMetadata()
