class BaseParser(object):
    game_ids = []
    game_title = None

    @classmethod
    def get_mapping(cls):
        raise Exception('not implemented')

    @classmethod
    def parse(cls, data):
        mapping = cls.get_mapping()

        scores = []
        for place in mapping:
            user = ''.join([chr(data[i]) for i in place['user']])
            score = int(''.join([f"{int(hex(data[i]).split('x')[1]):02d}" for i in place['score']]))
            scores.append({
                'user': user,
                'score': score,
            })
        return sorted(scores, key=lambda score: score['score'], reverse=True)


class AvspiritParser(BaseParser):
    game_ids = ['avspirit']
    game_title = 'Avenging Spirit'

    @classmethod
    def get_mapping(cls):
        return [{
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


class Missile1Parser(BaseParser):
    game_ids = ['missile1']
    game_title = 'Missile Command'

    @classmethod
    def get_mapping(cls):
        mapping = []
        for i in range(5):
            n = i * 3
            mapping.append({
                'user': (n, n + 1, n + 2),
                'score': (29 - n, 29 - n - 1, 29 - n - 2)
            })

        return mapping


PARSER_BY_GAME_ID = {
    game_id: parser
    for parser in BaseParser.__subclasses__()
    for game_id in parser.game_ids
}
