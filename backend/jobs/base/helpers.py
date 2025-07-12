from dataclasses import dataclass
from functools import partial
import random
import string
import time
import uuid

from .api_exceptions import (
    ForbiddenException,
    UnauthorizedException,
)

CHESS_VERSION = "0.0.1"
CHESS_GAME_ID_LENGTH = 6

LINK_ID_LENGTH = 6


class UserGroup:
    ADMIN: str = "admin"
    BUDGET: str = "budget-manager"
    LINK_MANAGER: str = "link-manager"


def get_expression_id(used_ids: set[str] = set()) -> str:
    for _ in range(10):
        expr_id = generate_alpha_id(2)
        if expr_id not in used_ids:
            return expr_id
    raise Exception("Failed to find expr_id")


def generate_id():
    return uuid.uuid4().hex


def get_timestamp():
    return str(int(time.time()))


def generate_alpha_id(length: int) -> str:
    return "".join(
        random.choices(
            string.ascii_lowercase,
            k=length,
        )
    )


def generate_chess_game_id() -> str:
    return generate_alphanumeric_id(CHESS_GAME_ID_LENGTH, lower=False)


def raise_key_required(key):
    raise ValueError(f"{key} required")


def ddb_item_required(key):
    return partial(raise_key_required, key)


def generate_alphanumeric_id(
    length: int = 8, lower: bool = True, upper: bool = True
) -> str:
    choices = [*string.digits]
    if lower:
        choices.extend(string.ascii_lowercase)
    if upper:
        choices.extend(string.ascii_uppercase)

    return "".join(random.choices(choices, k=length))


def chunk(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


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
                required_user_groups.add(UserGroup.ADMIN)

            if not (required_user_groups & set(s.user["groups"])):
                raise ForbiddenException(f'{user_group} not in {s.user["groups"]}')

            return func(s, *args, **kwargs)

        return wrapper

    return decorator
