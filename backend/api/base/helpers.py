from functools import partial
import random
import string
import time
import uuid

from .api_exceptions import (
    ForbiddenException,
    UnauthorizedException,
)


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


def generate_alphanumeric_id(length):
    return "".join(
        random.choices(
            string.ascii_lowercase + string.ascii_uppercase + string.digits,
            k=length,
        )
    )


def requires_authentication(func):
    def wrapper(s, *args, **kwargs):
        if not s.user["username"]:
            raise UnauthorizedException()
        return func(s, *args, **kwargs)

    return wrapper


def requires_user_group(user_group, exclude_admin=False):
    def decorator(func):
        def wrapper(s, *args, **kwargs):
            if not s.user["username"]:
                raise UnauthorizedException()

            required_user_groups = {user_group}
            if not exclude_admin:
                required_user_groups.add("admin")

            if not (required_user_groups & set(s.user["groups"])):
                raise ForbiddenException(f'{user_group} not in {s.user["groups"]}')

            return func(s, *args, **kwargs)

        return wrapper

    return decorator
