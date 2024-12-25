import json
import re

from base.lambda_handler_base import APILambdaHandlerBase
from base.api_exceptions import (
    BadRequestException,
    NotFoundException,
)

from base.aws import AWSConfig, DynamoDBConfig, DynamoDBTableConfig
from base.helpers import generate_chess_game_id, get_timestamp
from base.dynamodb import ChessGameDDBItem, ChessGameTable

TURN_REGEX_PATTERN = r"(?P<side>WHITE|BLACK)\|(?P<starting_space>[A-Z]\d)\|(?P<ending_space>[A-Z]\d)\|(?P<turn_type>\w+)\|(?P<options>\w*)"


class ChessLambdaHandler(APILambdaHandlerBase):
    primary_partition_key = "game_id"
    aws_config = AWSConfig(
        dynamodb=DynamoDBConfig(
            enabled=True,
            tables=[DynamoDBTableConfig("chess_game", ChessGameTable)],
        )
    )

    def _init(self):
        self.turn_regex_pattern = re.compile(TURN_REGEX_PATTERN)

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

    def _new_game(self, game_mode, player_one=None, player_two=None):
        print("Creating new game")
        timestamp = get_timestamp()
        chess_game_dict = {
            "game_id": generate_chess_game_id(),
            "game_mode": game_mode,
            "time_created": timestamp,
            "time_updated": timestamp,
        }

        if player_one:
            chess_game_dict["player_one"] = player_one
        if player_two:
            chess_game_dict["player_two"] = player_two

        chess_game = ChessGameDDBItem.from_dict(chess_game_dict)
        self.aws.dynamodb.tables["chess_game"].put(chess_game)

        return chess_game.to_dict()

    def _save_turn(self, game_id, turn):
        print("saving new turn")
        new_turn = self._deserialize_turn(turn)
        game = (
            self.aws.dynamodb.tables["chess_game"]
            .get(
                game_id=game_id,
                user=self.user,
            )
            .to_dict()
        )

        if game["turns"]:
            serialized_last_turn = game["turns"][-1]["S"]
            last_turn = self._deserialize_turn(serialized_last_turn)
            if new_turn["side"] == last_turn["side"]:
                raise BadRequestException(f"not {new_turn['side']}'s turn!")

        update_dict = {
            "turns": {
                "value": [{"S": turn}],
                "operation": "list_append",
            },
        }
        game = self.aws.dynamodb.tables["chess_game"].update(
            ChessGameDDBItem.build_ddb_key(game_id=game_id),
            update_dict,
        )

        return game.to_dict()

    def handle_get(self):
        resource = self.get_resource()

        if resource == "game":
            game_id = self.params.get("game_id")
            if game_id:
                result = (
                    self.aws.dynamodb.tables["chess_game"]
                    .get(
                        game_id=game_id,
                        user=self.user,
                    )
                    .to_dict()
                )
            elif self.params.get("current_user") == "true":
                if self.user["username"]:
                    result = self.aws.dynamodb.tables["chess_game"].scan(
                        {
                            "player_one": self.user["username"],
                            "player_two": self.user["username"],
                        },
                        operator="OR",
                    )
                else:
                    raise PermissionError("cannot fetch by user")
            else:
                raise BadRequestException("game_id or current_user required")
        else:
            raise NotFoundException("unsupported resource: {}".format(resource))

        return {
            **self._empty_response(),
            "body": json.dumps(result),
        }

    def handle_post(self):
        resource = self.get_resource()

        if resource == "game":
            game_mode = self.params.get("game_mode")
            if not game_mode:
                raise BadRequestException("need game_mode")
            player_one = self.user.get("username")
            player_two = (
                player_one if game_mode == "local" else self.params.get("player_two")
            )
            result = self._new_game(game_mode, player_one, player_two)
        elif resource == "turn":
            game_id = self.params.get("game_id")
            turn = self.params.get("turn")
            if not game_id or not turn:
                raise BadRequestException("game_id and turn required")
            result = self._save_turn(game_id, turn)

        return {**self._empty_response(), "body": json.dumps(result)}


def lambda_handler(event, context):
    return ChessLambdaHandler(event, context).handle()
