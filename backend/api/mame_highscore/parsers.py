def default_chr(data, indexes):
    return "".join([chr(data[i]) for i in indexes])


def default_int(data, indexes):
    return int("".join([chr(data[i]) for i in indexes]))


def hex_to_int(data, indexes):
    return int("".join([f"{int(hex(data[i]).split('x')[1]):02d}" for i in indexes]))


def galaga_score(data, indexes):
    return int("".join([f"{int(hex(data[i]).split('x')[1])}" for i in indexes]))


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
