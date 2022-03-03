import unittest


from mame_highscore import parsers, post_processors


class TestPostProcessors(unittest.TestCase):
    def test_multiply_ten(self):
        result = post_processors.multiply_ten(
            [{"score": -10}, {"score": 0}, {"score": 12}]
        )
        self.assertEqual(result, [{"score": -100}, {"score": 0}, {"score": 120}])


class TestParsers(unittest.TestCase):
    def test_default_chr(self):
        result = parsers.default_chr(
            [48, 49, 50, 51, 52, 52],
            [0, 3, 4],
        )
        self.assertEqual(result, "034")

    def test_default_int(self):
        result = parsers.default_int(
            [48, 49, 50, 51, 52, 52],
            [0, 3, 4],
        )
        self.assertEqual(result, 34)

    def test_hex_to_int(self):
        result = parsers.hex_to_int(
            [17, 18, 19, 20, 21],
            [0, 3, 4],
        )
        self.assertEqual(result, 111415)

    def test_galaga_score(self):
        result = parsers.galaga_score(
            [17, 18, 19, 20, 21],
            [0, 3, 4],
        )
        self.assertEqual(result, 111415)

    def test_galaga_user(self):
        result = parsers.galaga_user(
            [12, 18, 33, 22, 15],
            [0, 2, 3],
        )
        self.assertEqual(result, "CXMa")
