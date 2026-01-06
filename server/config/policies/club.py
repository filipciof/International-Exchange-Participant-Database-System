from config.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_staff,
    is_student,
    student_has_exchange_with_club,
)
from config.policies.fail_closed import fail_closed


@fail_closed()
def can_view(user, club) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (is_club_officer(user) and (club == user.id_staff.id_club))
        or (is_student(user) and (student_has_exchange_with_club(user.id_student, club)))
    )


@fail_closed()
def can_edit(user, club, data=None) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (is_club_officer(user) and (club == user.id_staff.id_club))
    )


@fail_closed()
def can_delete(user, club) -> bool:
    return can_edit(user, club, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    return is_staff(user)
