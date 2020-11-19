import argparse
import os

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
    mapping = [{
        'score': (
            (8 * n) + 5,
            ((8 * n) + 5 + 1),
            ((8 * n) + 5 + 2),
        ),
        'user': (
            ((8 * n) + 5 + 3),
            ((8 * n) + 5 + 4),
            ((8 * n) + 5 + 5),
        ),
    } for n in range(0, 10)]

    scores = []
    for place in mapping:
        user = ''.join([chr(data[i]) for i in place['user']])
        score = int(''.join([f"{int(hex(data[i]).split('x')[1]):02d}" for i in place['score']]))
        scores.append({
            'user': user,
            'score': score,
        })
    return scores


class TestParser(object):
    def __init__(self):
        self.parser = argparse.ArgumentParser()
        self.parser.add_argument('game', help='game/parser to test', nargs=1)

        self.score_parsers = {
            'avspirit': avspirit,
        }

        self.args = self.parser.parse_args()

        # remove .hi suffix if exists
        self.game = self.args.game[0].split('.hi')[0]

        if not self.game in self.score_parsers:
            raise Exception('parser for {} not set up'.format(self.game))

    def game_filepath(self):
        filename = self.game + '.hi'
        return './input/{}'.format(filename)

    def run(self):
        with open(self.game_filepath(), 'rb') as f:
            data = f.read()
        result = self.score_parsers[self.game](data)
        print(result)


if __name__ == '__main__':
    TestParser().run()

