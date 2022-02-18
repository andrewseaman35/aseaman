import json
import os

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
        assert game["index_id"] in indexes, f"index_id {game['index_id']} not defined"
        assert (
            game["parser_id"] in PARSERS_BY_ID
        ), f"parser_id {game['parser_id']} not defined"
        if game["post_processor_id"]:
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
        if not cls.implemented(game_id):
            return game_id
        return PARSER_CONFIG["games"][game_id]["title"]

    @classmethod
    def implemented(cls, game_id):
        return game_id in PARSER_CONFIG["games"]

    @classmethod
    def parse(cls, game_id, data):
        game = PARSER_CONFIG["games"][game_id]
        indexes = PARSER_CONFIG["indexes"][game["index_id"]]
        score_parser_id = game["score_parser_id"]
        user_parser_id = game.get("user_parser_id")
        post_processor_id = game.get("post_processor_id")

        score_parser = PARSERS_BY_ID[score_parser_id]
        user_parser = PARSERS_BY_ID[user_parser_id] if user_parser_id else None
        post_processor = POST_PROCESSORS_BY_ID.get(post_processor_id)

        parsed_scores = []
        for place in indexes:
            score_data = {}
            if "user" in place and user_parser:
                score_data["user"] = user_parser(data, place["user"])
            score_data["score"] = score_parser(data, place["score"])
            parsed_scores.append(score_data)

        sorted_parsed_scores = sorted(
            parsed_scores, key=lambda score: score["score"], reverse=True
        )
        final_scores = (
            post_processor(sorted_parsed_scores)
            if post_processor
            else sorted_parsed_scores
        )

        return final_scores
