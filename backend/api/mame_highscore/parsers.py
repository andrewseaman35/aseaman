class BaseParser(object):
    game_ids = []
    game_title = None
    parse_user = True
    parse_score = True

    @classmethod
    def get_mapping(cls):
        raise Exception('not implemented')

    @classmethod
    def post_process_parsed(cls, parsed):
        return parsed

    @classmethod
    def parse(cls, data):
        mapping = cls.get_mapping()

        scores = []
        for place in mapping:
            score_data = {}
            if cls.parse_user:
                score_data['user'] = ''.join([chr(data[i]) for i in place['user']])
            if cls.parse_score:
                score_data['score'] = int(''.join([f"{int(hex(data[i]).split('x')[1]):02d}" for i in place['score']]))
            scores.append(score_data)
        parsed = sorted(scores, key=lambda score: score['score'], reverse=True)
        return cls.post_process_parsed(parsed)


class AvspiritParser(BaseParser):
    game_ids = ['avspirit']
    game_title = 'Avenging Spirit'

    @classmethod
    def get_mapping(cls):
        return [
            {'user': (8, 9, 10), 'score': (5, 6, 7)},
            {'user': (16, 17, 18), 'score': (13, 14, 15)},
            {'user': (24, 25, 26), 'score': (21, 22, 23)},
            {'user': (32, 33, 34), 'score': (29, 30, 31)},
            {'user': (40, 41, 42), 'score': (37, 38, 39)},
            {'user': (48, 49, 50), 'score': (45, 46, 47)},
            {'user': (56, 57, 58), 'score': (53, 54, 55)},
            {'user': (64, 65, 66), 'score': (61, 62, 63)},
            {'user': (72, 73, 74), 'score': (69, 70, 71)},
            {'user': (80, 81, 82), 'score': (77, 78, 79)},
        ]


class MissileParser(BaseParser):
    game_ids = ['missile1']
    game_title = 'Missile Command'

    @classmethod
    def get_mapping(cls):
        return [
            {'user': (0, 1, 2), 'score': (17, 16, 15)},
            {'user': (3, 4, 5), 'score': (20, 19, 18)},
            {'user': (6, 7, 8), 'score': (23, 22, 21)},
            {'user': (9, 10, 11), 'score': (26, 25, 24)},
            {'user': (12, 13, 14), 'score': (29, 28, 27)},
        ]


class GalagaParser(BaseParser):
    game_ids = ['galaga']
    game_title = 'Galaga'

    @classmethod
    def parse(cls, data):
        mapping = cls.get_mapping()

        scores = []
        def get_user_val(data, index):
            val = data[index]
            if 10 <= val <= 35:
                # A-Z
                shift =  55
            else:
                # sort of a guess, based on "." only
                shift = 4
            return chr(shift + val)

        for place in mapping:
            user = ''.join([get_user_val(data, i) for i in place['user']])
            score = int(''.join([f"{int(hex(data[i]).split('x')[1])}" for i in place['score']]))
            scores.append({
                'user': user,
                'score': score,
            })
        return scores

    @classmethod
    def get_mapping(cls):
        return [
            {'user': (30, 31, 32), 'score': (4, 3, 2, 1, 0)},
            {'user': (33, 34, 35), 'score': (10, 9, 8, 7, 6)},
            {'user': (36, 37, 38), 'score': (16, 15, 14, 13, 12)},
            {'user': (39, 40, 41), 'score': (22, 21, 20, 19, 18)},
            {'user': (42, 43, 44), 'score': (28, 27, 26, 25, 24)},
        ]


class FroggerParser(BaseParser):
    game_ids = ['frogger']
    game_title = 'Frogger'
    parse_user = False

    @classmethod
    def get_mapping(cls):
        return [
            {'score': (1, 0)},
            {'score': (3, 2)},
            {'score': (5, 4)},
            {'score': (7, 6)},
            {'score': (9, 8)},
        ]

    @classmethod
    def post_process_parsed(cls, parsed):
        for place in parsed:
            place['score'] *= 10
        return parsed


class DKong3Parser(BaseParser):
    game_ids = ['dkong3']
    game_title = 'Donkey Kong 3'

    @classmethod
    def get_mapping(cls):
        return [
            {
                'user': (15, 16, 17),
                'score': (7, 8, 9, 10, 11, 12),
            },
            {
                'user': (49, 50, 51),
                'score': (41, 42, 43, 44, 45, 46),
            },
            {
                'user': (83, 84, 85),
                'score': (75, 76, 77, 78, 70, 80),
            },
            {
                'user': (117, 118, 119),
                'score': (109, 110, 111, 112, 113, 114),
            },
            {
                'user': (151, 152, 153),
                'score': (143, 144, 145, 146, 147, 148)
            },
        ]

    @classmethod
    def parse(cls, data):
        mapping = cls.get_mapping()

        scores = []
        for place in mapping:
            user = ''.join([chr(data[i]) for i in place['user']])
            score = int(''.join([chr(data[i]) for i in place['score']]))
            scores.append({
                'user': user,
                'score': score,
            })
        return scores


PARSER_BY_GAME_ID = {
    game_id: parser
    for parser in BaseParser.__subclasses__()
    for game_id in parser.game_ids
}
