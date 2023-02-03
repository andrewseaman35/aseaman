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
