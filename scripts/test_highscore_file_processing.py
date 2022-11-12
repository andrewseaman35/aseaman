import os
import shutil

from base import BaseScript


class TestHighscoreFileProcessing(BaseScript):
    aws_enabled = False

    def _setup_parser(self):
        super(TestHighscoreFileProcessing, self)._setup_parser()
        self.parser.add_argument("--filename", help="filename")

    def _validate_args(self):
        super(TestHighscoreFileProcessing, self)._validate_args()
        filename = self.args.filename
        self.filepath = os.path.join(os.path.dirname(__file__), f"{filename}")
        if not os.path.exists(self.filepath):
            raise ValueError(f"couldn't find {self.filepath}")

    def _copy_over_parsers(self):
        do_it = input("copy over parsers?? ")
        if do_it.lower() in {"y", "yes", "eyy"}:
            parser_file = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "backend",
                "api",
                "mame_highscore",
                "parsers.py",
            )
            dest = os.path.join(os.path.dirname(__file__), "highscore_parsers.py")
            print(f"Copying over parsers from {parser_file} to {dest}")
            shutil.copy(parser_file, dest)

    def run(self):
        self._copy_over_parsers()

        import highscore_parsers

        with open(self.filepath, "rb") as f:
            data = f.read()

        print(data)
        print(data[0])
        users = [
            highscore_parsers.default_chr(data, [114, 115, 116]),
            highscore_parsers.default_chr(data, [136, 137, 138]),
            highscore_parsers.default_chr(data, [202, 203, 204]),
            highscore_parsers.default_chr(data, [48, 49, 50]),
            highscore_parsers.default_chr(data, [70, 71, 72]),
        ]
        print(users)

        print(data[16])
        print(data[17])
        scores = [
            None,
            None,
            int(data[16], 16),
        ]
        print(scores)


if __name__ == "__main__":
    TestHighscoreFileProcessing().run()
