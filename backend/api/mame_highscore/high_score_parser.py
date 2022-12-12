import json
import os

from game_metadata import GAME_METADATA
from parsers import PARSERS_BY_ID
from post_processors import POST_PROCESSORS_BY_ID


PARSER_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "parser_config.json")


def load_parser_config():
    parser_config = json.load(open(PARSER_CONFIG_FILE, "r"))
    return parser_config


def validate_parser_config(config):
    # unused for now
    games = config["games"]
    indexes = config["indexes"]
    for game_id, game in games.values():
        assert game["title"], f"game_id {game_id} has no title"
        assert game_id in indexes, f"game id {game_id} not defined"
        assert (
            game["parser_id"] in PARSERS_BY_ID
        ), f"parser_id {game['parser_id']} not defined"
        if game.get("post_processor_id"):
            assert (
                game["post_processor_id"] in POST_PROCESSORS_BY_ID
            ), f"post_processor_id {game['post_processor_id']} not defined"


PARSER_CONFIG = load_parser_config()


class HighScoreParser(object):
    @classmethod
    def get_games(cls):
        return [key for key in PARSER_CONFIG["games"].keys()]

    @classmethod
    def get_game_title(cls, game_id):
        game_name = game_id

        if game_id in GAME_METADATA:
            game_name = GAME_METADATA[game_id].title

        game_config = PARSER_CONFIG["games"].get(game_id)
        if game_config and game_config.get("title"):
            game_name = game_config["title"]

        return game_name

    @classmethod
    def implemented(cls, game_id):
        parser = PARSER_CONFIG["games"].get(game_id)
        if not parser:
            return False
        return bool(parser.get("score_parser_id") or parser.get("user_parser_id"))

    @classmethod
    def parse(cls, game_id, data):
        game = PARSER_CONFIG["games"][game_id]
        indexes = PARSER_CONFIG["indexes"][game_id]
        score_parser_id = game.get("score_parser_id")
        user_parser_id = game.get("user_parser_id")
        post_processor_id = game.get("post_processor_id")

        score_parser = PARSERS_BY_ID[score_parser_id] if score_parser_id else None
        user_parser = PARSERS_BY_ID[user_parser_id] if user_parser_id else None
        post_processor = POST_PROCESSORS_BY_ID.get(post_processor_id)

        parsed_scores = []
        for place in indexes:
            score_data = {}
            if "user" in place and user_parser:
                score_data["user"] = user_parser(data, place["user"])
            if "score" in place and score_parser:
                score_data["score"] = score_parser(data, place["score"])
            parsed_scores.append(score_data)

        sorted_parsed_scores = sorted(
            parsed_scores, key=lambda score: score.get("score", 0), reverse=True
        )
        final_scores = (
            post_processor(sorted_parsed_scores)
            if post_processor
            else sorted_parsed_scores
        )

        return final_scores
