def default_chr(data, indexes):
    return "".join([chr(data[i]) for i in indexes])


def default_int(data, indexes):
    return int("".join([chr(data[i]) for i in indexes]))


def hex_to_int(data, indexes):
    return int("".join([f"{int(hex(data[i]).split('x')[1]):02d}" for i in indexes]))


def galaga_score(data, indexes):
    # I'm not 100% sure if this is correct. For scores less than 100k, the value
    # stored in the first slot is 0x36 (24). Once we hit 100k, it transitions to 1.
    # I suspect that we ignore the first value if it's less than 10, and scores over
    # 100k will use double digit values in other indexes to track scores in the millions.
    # It probably doesn't matter becuase I'll likely never score over 1M :(
    int_values = [int(hex(data[i]).split("x")[1]) for i in indexes]
    first_index = 1 if int_values[0] >= 10 else 0
    return int("".join([f"{int_value}" for int_value in int_values[first_index:]]))


def galaga_user(data, indexes):
    def get_user_val(data, index):
        val = data[index]
        if 10 <= val <= 35:  # A-Z
            shift = 55
        else:
            shift = 4  # sort of a guess, based on "." only
        return chr(shift + val)

    return "".join([get_user_val(data, i) for i in indexes])


PARSERS_BY_ID = {
    "default_chr": default_chr,
    "default_int": default_int,
    "hex_to_int": hex_to_int,
    "galaga_user": galaga_user,
    "galaga_score": galaga_score,
}
