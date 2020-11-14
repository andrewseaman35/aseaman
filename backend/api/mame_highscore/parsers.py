def parse_avspirit(data):
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


PARSER_BY_GAME_ID = {
    'avspirit': parse_avspirit,
}
