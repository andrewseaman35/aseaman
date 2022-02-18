import json
import random
import re
import string
import time

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
)

TABLE_NAME = "chess_game"
LOCAL_TABLE_NAME = "chess_game"

GAME_ID_LENGTH = 6
TURN_REGEX_PATTERN = r"(?P<side>WHITE|BLACK)\|(?P<starting_space>[A-Z]\d)\|(?P<ending_space>[A-Z]\d)\|(?P<turn_type>\w+)\|(?P<options>\w*)"

VERSION = "0.0.1"


class ChessLambdaHandler(APILambdaHandlerBase):
    require_auth = False

    primary_partition_key = "game_id"

    def _init(self):
        self.table_name = LOCAL_TABLE_NAME if self.is_local else TABLE_NAME
        self.turn_regex_pattern = re.compile(TURN_REGEX_PATTERN)

    def _init_aws(self):
        self.ddb_client = self.aws_session.client("dynamodb", region_name="us-east-1")

    def _deserialize_turn(self, turn):
        match = self.turn_regex_pattern.match(turn)
        if not match:
            raise BadRequestException("invalid turn format")
        side, starting_space, ending_space, turn_type, options = match.groups()
        if side not in {"WHITE", "BLACK"}:
            raise BadRequestException("invalid side")
        if turn_type not in {
            "normal",
            "kingside_castle",
            "queenside_castle",
            "en_passant",
            "promotion",
        }:
            raise BadRequestException("invalid turn type")
        return {
            "side": side,
            "starting_space": starting_space,
            "ending_space": ending_space,
            "turn_type": turn_type,
            "options": options,
        }

    def _new_game_id(self):
        return "".join(
            random.choices(string.ascii_uppercase + string.digits, k=GAME_ID_LENGTH)
        )

    def _get_timestamp(self):
        return str(int(time.time()))

    def _format_ddb_item(self, ddbItem):
        return {
            "game_id": ddbItem["game_id"]["S"],
            "game_mode": ddbItem["game_mode"]["S"],
            "turns": [turn["S"] for turn in ddbItem["turns"]["L"]],
            "time_created": ddbItem["time_created"]["N"],
            "time_updated": ddbItem["time_updated"]["N"],
            "version": ddbItem["version"]["S"],
        }

    def _build_new_game_ddb_item(self, game_mode):
        timestamp = self._get_timestamp()
        return {
            "game_id": {
                "S": self._new_game_id(),
            },
            "game_mode": {
                "S": game_mode,
            },
            "turns": {
                "L": [],
            },
            "time_created": {
                "N": timestamp,
            },
            "time_updated": {
                "N": timestamp,
            },
            "version": {
                "S": VERSION,
            },
        }

    def __fetch_game(self, game_id):
        ddbItem = self.ddb_client.get_item(
            TableName=self.table_name,
            Key={
                "game_id": {
                    "S": game_id,
                },
            },
        )
        if "Item" not in ddbItem:
            raise NotFoundException("game not found")

        return self._format_ddb_item(ddbItem["Item"])

    def _new_game(self, game_mode):
        print("Creating new game")
        ddbItem = self._build_new_game_ddb_item(game_mode)
        self.ddb_client.put_item(
            TableName=self.table_name,
            Item=ddbItem,
        )
        return self._format_ddb_item(ddbItem)

    def _save_turn(self, game_id, turn):
        print("saving new turn")
        new_turn = self._deserialize_turn(turn)
        game = self.__fetch_game(game_id)

        if game["turns"]:
            serialized_last_turn = game["turns"][-1]
            last_turn = self._deserialize_turn(serialized_last_turn)
            if new_turn["side"] == last_turn["side"]:
                raise BadRequestException(f"not {new_turn['side']}'s turn!")

        response = self.ddb_client.update_item(
            TableName=self.table_name,
            Key={
                "game_id": {"S": game_id},
            },
            UpdateExpression="SET turns = list_append(#t, :t), #tu = :tu",
            ExpressionAttributeNames={
                "#t": "turns",
                "#tu": "time_updated",
            },
            ExpressionAttributeValues={
                ":t": {"L": [{"S": turn}]},
                ":tu": {"N": self._get_timestamp()},
            },
            ReturnValues="ALL_NEW",
        )
        return response

    def handle_get(self):
        path_parts = self.event["path"].strip("/").split("/")
        resource = path_parts[1] if len(path_parts) > 1 else None

        if resource == "game":
            game_id = self.params.get("game_id")
            if not game_id:
                raise BadRequestException("game_id required")
            result = self.__fetch_game(game_id)
        else:
            raise NotFoundException("unsupported resource: {}".format(resource))

        return {
            **self._empty_response(),
            "body": json.dumps(result),
        }

    def handle_post(self):
        print("handling post")
        path_parts = self.event["path"].strip("/").split("/")
        resource = path_parts[1] if len(path_parts) > 1 else None

        if resource == "game":
            game_mode = self.params.get("game_mode")
            if not game_mode:
                raise BadRequestException("need game_mode")
            result = self._new_game(game_mode)
        elif resource == "turn":
            game_id = self.params.get("game_id")
            turn = self.params.get("turn")
            if not game_id or not turn:
                raise BadRequestException("game_id and turn required")
            result = self._save_turn(game_id, turn)

        return {**self._empty_response(), "body": json.dumps(result)}


def lambda_handler(event, context):
    return ChessLambdaHandler(event, context).handle()
