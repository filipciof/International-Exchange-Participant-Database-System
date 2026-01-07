from config.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_staff,
    student_has_exchange_with_club,
)
from config.policies.fail_closed import fail_closed


@fail_closed()
def can_view(user, student) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (
            is_club_officer(user)
            and student_has_exchange_with_club(student, user.id_staff.id_club)
        )
    )


@fail_closed()
def can_edit(user, student, data=None) -> bool:
    return can_view(user, student)


@fail_closed()
def can_delete(user, student) -> bool:
    return can_edit(user, student, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    return is_staff(user)
