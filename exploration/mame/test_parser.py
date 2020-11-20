import argparse
import os


def parse(data, mapping):
    scores = []
    for place in mapping:
        user = ''.join([chr(data[i]) for i in place['user']])
        score = int(''.join([f"{int(hex(data[i]).split('x')[1]):02d}" for i in place['score']]))
        scores.append({
            'user': user,
            'score': score,
        })
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
    mapping = []
    for i in range(10):
        n = i * 8
        mapping.append({
            'user': (
                (n + 5 + 3),
                (n + 5 + 4),
                (n + 5 + 5),
            ),
            'score': (
                (n + 5),
                (n + 5 + 1),
                (n + 5 + 2),
            ),
        })
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
    mapping = []
    for i in range(5):
        n = i * 3
        mapping.append({
            'user': (n, n + 1, n + 2),
            'score': (
                (n + 15 + 2),
                (n + 15 + 1),
                (n + 15),
            ),
        })
    print(mapping)
    return parse(data, mapping)

def pacman(data):
    import pdb; pdb.set_trace()

class TestParser(object):
    def __init__(self):
        self.parser = argparse.ArgumentParser()
        self.parser.add_argument('game', help='game/parser to test', nargs=1)

        self.args = self.parser.parse_args()

        # remove .hi suffix if exists
        self.game = self.args.game[0].split('.hi')[0]

        if not self.game in globals():
            raise Exception('parser for {} not set up'.format(self.game))

    def game_filepath(self):
        filename = self.game + '.hi'
        return './input/{}'.format(filename)

    def run(self):
        with open(self.game_filepath(), 'rb') as f:
            data = f.read()
        result = globals()[self.game](data)
        print(result)


if __name__ == '__main__':
    TestParser().run()

