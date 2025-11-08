import argparse
import os


def parse(data, mapping, get_scores=True, get_user=True):
    print(mapping)
    scores = []
    for place in mapping:
        user = get_user and "".join([chr(data[i]) for i in place["user"]])
        score = get_scores and int(
            "".join([f"{int(hex(data[i]).split('x')[1]):02d}" for i in place["score"]])
        )
        scores.append(
            {
                "user": user,
                "score": score,
            }
        )
    return scores


"""
avspirit.hi
100,000 JAL
 90,000 B.R
 80,000 R.L
 70,000 P.A
 60,000 L.K
 50,000 HAC
 40,000 S.D
 30,000 TAK
 20,000 P47
 10,000 BUT
"""


def avspirit(data):
    # mapping = []
    # for i in range(10):
    #     n = i * 8
    #     mapping.append({
    #         'user': (
    #             (n + 5 + 3),
    #             (n + 5 + 4),
    #             (n + 5 + 5),
    #         ),
    #         'score': (
    #             (n + 5),
    #             (n + 5 + 1),
    #             (n + 5 + 2),
    #         ),
    #     })
    mapping = [
        {"user": (8, 9, 10), "score": (5, 6, 7)},
        {"user": (16, 17, 18), "score": (13, 14, 15)},
        {"user": (24, 25, 26), "score": (21, 22, 23)},
        {"user": (32, 33, 34), "score": (29, 30, 31)},
        {"user": (40, 41, 42), "score": (37, 38, 39)},
        {"user": (48, 49, 50), "score": (45, 46, 47)},
        {"user": (56, 57, 58), "score": (53, 54, 55)},
        {"user": (64, 65, 66), "score": (61, 62, 63)},
        {"user": (72, 73, 74), "score": (69, 70, 71)},
        {"user": (80, 81, 82), "score": (77, 78, 79)},
    ]
    return parse(data, mapping)


"""
missle1.hi
 8500?AAA
 7500 DFT
 7495 DLS
 7330 SRC
 7005 RDA
"""


def missile1(data):
    # mapping = []
    # for i in range(5):
    #     n = i * 3
    #     mapping.append({
    #         'user': (n, n + 1, n + 2),
    #         'score': (
    #             (n + 15 + 2),
    #             (n + 15 + 1),
    #             (n + 15),
    #         ),
    #     })
    # print(mapping)
    mapping = [
        {"user": (0, 1, 2), "score": (17, 16, 15)},
        {"user": (3, 4, 5), "score": (20, 19, 18)},
        {"user": (6, 7, 8), "score": (23, 22, 21)},
        {"user": (9, 10, 11), "score": (26, 25, 24)},
        {"user": (12, 13, 14), "score": (29, 28, 27)},
    ]
    return parse(data, mapping)


def galaga(data):
    def parse(data, mapping):
        print(mapping)
        scores = []

        def get_user_val(data, index):
            val = data[index]
            if 10 <= val <= 35:
                # A-Z
                shift = 55
            else:
                # sort of a guess, based on "." only
                shift = 4
            return chr(shift + val)

        for place in mapping:
            user = "".join([get_user_val(data, i) for i in place["user"]])
            score = int(
                "".join([f"{int(hex(data[i]).split('x')[1])}" for i in place["score"]])
            )
            scores.append(
                {
                    "user": user,
                    "score": score,
                }
            )
        return scores

    mapping = []
    # for i in range(5):
    #     user_n = i * 3
    #     score_n = i * 6
    #     mapping.append({
    #         'user': (
    #             (user_n + 30),
    #             (user_n + 30 + 1),
    #             (user_n + 30 + 2),
    #         ),
    #         'score': (
    #             (score_n + 4),
    #             (score_n + 3),
    #             (score_n + 2),
    #             (score_n + 1),
    #             (score_n),
    #         ),
    #     })
    mapping = [
        {"user": (30, 31, 32), "score": (4, 3, 2, 1, 0)},
        {"user": (33, 34, 35), "score": (10, 9, 8, 7, 6)},
        {"user": (36, 37, 38), "score": (16, 15, 14, 13, 12)},
        {"user": (39, 40, 41), "score": (22, 21, 20, 19, 18)},
        {"user": (42, 43, 44), "score": (28, 27, 26, 25, 24)},
    ]
    # import pdb; pdb.set_trace()
    return parse(data, mapping)


"""
012000 WIN    4057 494e
009000 MAI
008000 OGA
005400 SUZ
003200 YOU
"""


def dkong3(data):
    print(data)

    def parse(data, mapping, get_scores=True, get_user=True):
        scores = []
        for place in mapping:
            user = get_user and "".join([chr(data[i]) for i in place["user"]])
            score = get_scores and int("".join([chr(data[i]) for i in place["score"]]))
            scores.append(
                {
                    "user": user,
                    "score": score,
                }
            )
        return scores

    mapping = [
        {
            "user": (15, 16, 17),
            "score": (7, 8, 9, 10, 11, 12),
        },
        {
            "user": (49, 50, 51),
            "score": (41, 42, 43, 44, 45, 46),
        },
        {
            "user": (83, 84, 85),
            "score": (75, 76, 77, 78, 70, 80),
        },
        {
            "user": (117, 118, 119),
            "score": (109, 110, 111, 112, 113, 114),
        },
        {"user": (151, 152, 153), "score": (143, 144, 145, 146, 147, 148)},
    ]
    return parse(data, mapping)


def frogger(data):
    print(data)
    mapping = [
        {"score": (1, 0)},
        {"score": (3, 2)},
        {"score": (5, 4)},
        {"score": (7, 6)},
        {"score": (9, 8)},
    ]
    m = []
    for i in range(5):
        score_n = i * 2
        m.append(
            {
                "score": ((score_n + 1), (score_n)),
            }
        )
    import pdb

    pdb.set_trace()
    return parse(data, mapping, get_user=False)


def galaxian(data):
    print(data)
    import pdb

    pdb.set_trace()


def outrun(data):
    print(data)
    import pdb

    pdb.set_trace()


class TestParser(object):
    def __init__(self):
        self.parser = argparse.ArgumentParser()
        self.parser.add_argument("game", help="game/parser to test", nargs=1)

        self.args = self.parser.parse_args()

        # remove .hi suffix if exists
        self.game = self.args.game[0].split(".hi")[0]

        if not self.game in globals():
            raise Exception("parser for {} not set up".format(self.game))

    def game_filepath(self):
        filename = self.game + ".hi"
        return "./input/{}".format(filename)

    def run(self):
        with open(self.game_filepath(), "rb") as f:
            data = f.read()
        result = globals()[self.game](data)
        print(result)


if __name__ == "__main__":
    TestParser().run()
