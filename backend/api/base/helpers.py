from .api_exceptions import (
    ForbiddenException,
    UnauthorizedException,
)


def requires_authentication(func):
    def wrapper(s, *args, **kwargs):
        if not s.user["username"]:
            raise UnauthorizedException()
        return func(s, *args, **kwargs)

    return wrapper


def requires_user_group(user_group):
    def decorator(func):
        def wrapper(s, *args, **kwargs):
            if not s.user["username"]:
                raise UnauthorizedException()

            if user_group not in s.user["groups"]:
                raise ForbiddenException()

            return func(s, *args, **kwargs)

        return wrapper

    return decorator
