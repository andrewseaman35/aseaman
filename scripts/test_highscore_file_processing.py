import json
import os
from pathlib import Path
import shutil

from base import BaseScript


IMPORTS_DIRNAME = "imports"
BASE_DIR = os.path.dirname(__file__)
IMPORTS_DIR = None


def make_imports_setup():
    imports_dir = os.path.join(BASE_DIR, IMPORTS_DIRNAME)
    os.makedirs(imports_dir, exist_ok=True)
    init_file = os.path.join(imports_dir, "__init__.py")
    Path(init_file).touch()
    global IMPORTS_DIR
    IMPORTS_DIR = imports_dir


make_imports_setup()
PARSER_CONFIG_FILE = os.path.join(IMPORTS_DIR, "parser_config.json")


def load_parser_config():
    parser_config = json.load(open(PARSER_CONFIG_FILE, "r"))
    return parser_config


class TestHighscoreFileProcessing(BaseScript):
    aws_enabled = False

    def _setup_parser(self):
        super(TestHighscoreFileProcessing, self)._setup_parser()
        self.parser.add_argument("--game", help="game")

    def _validate_args(self):
        super(TestHighscoreFileProcessing, self)._validate_args()
        self.game = self.args.game
        self.filepath = os.path.join(
            os.path.dirname(__file__), "outs", f"{self.game}.hi"
        )
        if not os.path.exists(self.filepath):
            raise ValueError(f"couldn't find {self.filepath}")

    def _copy_over_parsers(self):
        do_it = input("copy over files?? ")
        if do_it.lower() in {"y", "yes", "eyy"}:
            filenames = [
                "parsers.py",
                "parser_config.json",
            ]
            for filename in filenames:
                parser_file = os.path.join(
                    os.path.dirname(os.path.dirname(__file__)),
                    "backend",
                    "api",
                    "mame_highscore",
                    filename,
                )
                dest = os.path.join(str(IMPORTS_DIR), filename)
                print(f"Copying {filename} to {dest}")
                shutil.copy(parser_file, dest)

    def run(self):
        self._copy_over_parsers()

        import imports.parsers as parsers

        config = load_parser_config()
        if self.game not in config["games"] or self.game not in config["indexes"]:
            raise ValueError("game config doesn't exist")

        parser_config = config["games"][self.game]

        indexes = config["indexes"][self.game]
        user_parser = parsers.PARSERS_BY_ID[parser_config["user_parser_id"]]
        score_parser = parsers.PARSERS_BY_ID[parser_config["score_parser_id"]]

        with open(self.filepath, "rb") as f:
            data = f.read()

        print(f"Data length: {len(data)}")
        parsed_scores = []
        for place in indexes:
            score_data = {}
            if "user" in place and user_parser:
                score_data["user"] = user_parser(data, place["user"])
            if "score" in place and score_parser:
                score_data["score"] = score_parser(data, place["score"])
            parsed_scores.append(score_data)

        print(parsed_scores)
        for score in parsed_scores:
            print(f"Score: {score['user']}")
            print(f"       {score['score']}")
            print()


if __name__ == "__main__":
    TestHighscoreFileProcessing().run()
