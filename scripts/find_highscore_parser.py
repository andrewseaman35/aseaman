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


class FindHighscoreParser(BaseScript):
    aws_enabled = False

    def _setup_parser(self):
        super(FindHighscoreParser, self)._setup_parser()
        self.parser.add_argument(
            "--find", help="action to find games that need config", action="store_true"
        )
        self.parser.add_argument("--game", help="game")
        self.parser.add_argument("--initials", help="initials")

    def _validate_args(self):
        super(FindHighscoreParser, self)._validate_args()
        if self.args.find:
            return
        self.game = self.args.game
        if self.game is None:
            raise ValueError("--game required")
        self.filepath = os.path.join(
            os.path.dirname(__file__), "outs", f"{self.game}.hi"
        )
        if not os.path.exists(self.filepath):
            raise ValueError(f"couldn't find {self.filepath}")

    def _copy_over_parsers(self):
        do_it = input("copy over local file parser definition?? ")
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
        if self.args.find:
            configured_games = set([g for g in config["games"].keys()])
            game_keys = [
                x[:-3]
                for x in os.listdir(os.path.join(os.path.dirname(__file__), "outs"))
                if x.endswith(".hi")
            ]
            for gk in game_keys:
                if gk not in configured_games:
                    print(gk)
            return

        with open(self.filepath, "rb") as f:
            data = f.read()

        user_parsers = set(parsers.PARSERS_BY_ID.values())

        print(f"Data length: {len(data)}")
        for user_parser in user_parsers:
            print(f"--> {user_parser.__name__}")
            out = ""
            for i in range(len(data)):
                try:
                    out += f"{user_parser(data, [i])}"
                except Exception:
                    pass
            print(out)
            print("\n===")


if __name__ == "__main__":
    FindHighscoreParser().run()
