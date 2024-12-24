from functools import partial
import random
import string
import time
import uuid


class UserGroup:
    ADMIN = "admin"
    BUDGET = "budget"
    LINK_MANAGER = "link-manager"


def get_expression_id(used_ids=set()):
    for _ in range(10):
        expr_id = generate_alpha_id(2)
        if expr_id not in used_ids:
            return expr_id
    raise Exception("Failed to find expr_id")


def generate_id():
    return uuid.uuid4().hex


def get_timestamp():
    return str(int(time.time()))


def generate_alpha_id(length):
    return "".join(
        random.choices(
            string.ascii_lowercase,
            k=length,
        )
    )


def raise_key_required(key):
    raise ValueError(f"{key} required")


def ddb_item_required(key):
    return partial(raise_key_required, key)


def generate_alphanumeric_id(length=8, lower=True, upper=True):
    choices = [*string.digits]
    if lower:
        choices.extend(string.ascii_lowercase)
    if upper:
        choices.extend(string.ascii_uppercase)

    return "".join(random.choices(choices, k=length))
