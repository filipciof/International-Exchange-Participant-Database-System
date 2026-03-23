from main.permissions.base import is_admin, is_staff
from main.policies.fail_closed import fail_closed


@fail_closed()
def can_view(user, year) -> bool:
    return is_staff(user)


@fail_closed()
def can_edit(user, year, data=None) -> bool:
    return is_admin(user)


@fail_closed()
def can_delete(user, year) -> bool:
    return is_admin(user)


@fail_closed()
def can_create(user, data=None) -> bool:
    return is_admin(user)
