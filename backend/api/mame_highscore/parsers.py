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
        return mapping


class MissileParser(BaseParser):
    game_ids = ['missile1']
    game_title = 'Missile Command'

    @classmethod
    def get_mapping(cls):
        mapping = []
        for i in range(5):
            n = i * 3
            mapping.append({
                'user': (
                    n,
                    n + 1,
                    n + 2,
                ),
                'score': (
                    (n + 15 + 2),
                    (n + 15 + 1),
                    (n + 15),
                ),
            })

        return mapping


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
            print('HELLO')
            print(place)
            user = ''.join([get_user_val(data, i) for i in place['user']])
            score = int(''.join([f"{int(hex(data[i]).split('x')[1])}" for i in place['score']]))
            scores.append({
                'user': user,
                'score': score,
            })
        return scores

    @classmethod
    def get_mapping(cls):
        mapping = []
        for i in range(5):
            user_n = i * 3
            score_n = i * 6
            mapping.append({
                'user': (
                    (user_n + 30),
                    (user_n + 30 + 1),
                    (user_n + 30 + 2),
                ),
                'score': (
                    (score_n + 4),
                    (score_n + 3),
                    (score_n + 2),
                    (score_n + 1),
                    (score_n),
                ),
            })
        return mapping


class FroggerParser(BaseParser):
    game_ids = ['frogger']
    game_title = 'Frogger'
    parse_user = False

    @classmethod
    def get_mapping(cls):
        mapping = []
        for i in range(5):
            score_n = i * 2
            mapping.append({
                'score': (
                    (score_n + 1),
                    (score_n)
                ),
            })
        print(mapping)
        return mapping

    @classmethod
    def post_process_parsed(cls, parsed):
        for place in parsed:
            place['score'] *= 10
        return parsed


PARSER_BY_GAME_ID = {
    game_id: parser
    for parser in BaseParser.__subclasses__()
    for game_id in parser.game_ids
}
