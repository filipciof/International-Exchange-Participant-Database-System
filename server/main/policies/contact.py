from main.permissions.base import is_staff
from main.policies.fail_closed import fail_closed


@fail_closed()
def can_view(user, contact) -> bool:
    return is_staff(user)


@fail_closed()
def can_edit(user, contact, data=None) -> bool:
    return is_staff(user)


@fail_closed()
def can_delete(user, contact) -> bool:
    return can_edit(user, contact, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    return is_staff(user)
