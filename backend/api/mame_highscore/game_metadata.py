import json
import os
from typing import Any, Dict


GAME_METADATA_FILE: str = os.path.join(os.path.dirname(__file__), "game_metadata.json")


def load_game_metadata() -> Dict[str, Any]:
    parser_config: Dict[str, Any] = json.load(open(GAME_METADATA_FILE, "r"))
    return parser_config


class GameMetadataItem:
    def __init__(self, obj: Dict[str, Any]) -> None:
        self.data: Dict[str, Any] = obj

    @property
    def title(self) -> str:
        return self.data["title"]

    def serialize(self) -> Dict[str, str]:
        return {"title": self.title}


class GameMetadata(dict):
    def __init__(self) -> None:
        data: Dict[str, Any] = load_game_metadata()
        for k, v in data.items():
            self.__dict__[k] = GameMetadataItem(v)

    def __setitem__(self, key: str, item: GameMetadataItem) -> None:
        self.__dict__[key] = item

    def __getitem__(self, key: str) -> GameMetadataItem:
        return self.__dict__[key]

    def __contains__(self, key: str) -> bool:
        return key in self.__dict__


GAME_METADATA: GameMetadata = GameMetadata()
