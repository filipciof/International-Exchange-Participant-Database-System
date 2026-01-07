from config.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_staff,
    is_student,
    student_has_exchange_with_staff,
)
from config.policies.fail_closed import fail_closed


@fail_closed()
def can_view(user, staff) -> bool:
    return is_staff(user) or (
        is_student(user) and student_has_exchange_with_staff(user.id_student, staff)
    )


@fail_closed()
def can_edit(user, staff, data=None) -> bool:
    can_edit_staff = (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (is_club_officer(user) and user.id_staff == staff)
    )

    if not can_edit_staff:
        return False

    if data and "group" in data:
        return (
            is_admin(user)
            or is_correspondent(user)
            or is_kwm_officer(user)
            or (is_club_officer(user) and data.get("group") == "club_officer")
        )

    return True


@fail_closed()
def can_delete(user, staff) -> bool:
    return can_edit(user, staff, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    if not is_staff(user):
        return False

    if data and "group" in data:
        return (
            is_admin(user)
            or is_correspondent(user)
            or is_kwm_officer(user)
            or (is_club_officer(user) and data.get("group") == "club_officer")
        )

    return True
