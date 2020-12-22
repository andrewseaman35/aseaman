def multiply_ten(parsed):
    for place in parsed:
        place['score'] *= 10
    return parsed


POST_PROCESSORS_BY_ID = {
    'multiply_ten': multiply_ten,
}
