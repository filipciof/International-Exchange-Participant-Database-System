from main.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_staff,
    is_student,
    student_has_exchange_with_club,
)

from main.policies.fail_closed import fail_closed


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
        or (is_student(user) and student.id_user == user)
    )


@fail_closed()
def can_edit(user, student, data=None) -> bool:
    if is_admin(user):
        return True

    if is_student(user) and student.id_user == user:
        return True

    if is_staff(user) and data and set(data.keys()) <= {"notes"}:
        return True

    return False


@fail_closed()
def can_delete(user, student) -> bool:
    return is_admin(user)


@fail_closed()
def can_create(user, data=None) -> bool:
    return is_staff(user)
