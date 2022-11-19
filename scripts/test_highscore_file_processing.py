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

        print(len(data))
        users = [
            highscore_parsers.galaga_user(data, [30, 31, 32]),
            highscore_parsers.galaga_user(data, [33, 34, 35]),
            highscore_parsers.galaga_user(data, [36, 37, 38]),
            highscore_parsers.galaga_user(data, [39, 40, 41]),
            highscore_parsers.galaga_user(data, [42, 43, 44]),
        ]
        print(users)

        scores = [
            highscore_parsers.galaga_score(data, [5, 4, 3, 2, 1, 0]),
            highscore_parsers.galaga_score(data, [11, 10, 9, 8, 7, 6]),
            highscore_parsers.galaga_score(data, [17, 16, 15, 14, 13, 12]),
            highscore_parsers.galaga_score(data, [23, 22, 21, 20, 19, 18]),
            highscore_parsers.galaga_score(data, [29, 28, 27, 26, 25, 24]),
        ]
        print(scores)

        for i in range(len(users)):
            print(f"{users[i]} : {scores[i]}")


if __name__ == "__main__":
    TestHighscoreFileProcessing().run()
