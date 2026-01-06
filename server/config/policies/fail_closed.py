from functools import wraps


def fail_closed(default=False):
    """
    Wrap a policy function so that any exception
    results in a safe default (False).
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception:
                return default

        return wrapper

    return decorator
