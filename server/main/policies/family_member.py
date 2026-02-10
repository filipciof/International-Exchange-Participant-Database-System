from main.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_staff,
    is_student,
    student_has_exchange_with_family,
)
from main.policies.fail_closed import fail_closed


@fail_closed()
def can_view(user, family_member) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (
            is_club_officer(user)
            and (family_member.id_family.id_club == user.id_staff.id_club)
        )
        or (
            is_student(user)
            and student_has_exchange_with_family(
                user.id_student, family_member.id_family
            )
        )
    )


@fail_closed()
def can_edit(user, family_member, data=None) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (
            is_club_officer(user)
            and (family_member.id_family.id_club == user.id_staff.id_club)
        )
    )


@fail_closed()
def can_delete(user, family_member) -> bool:
    return can_edit(user, family_member, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    return is_staff(user)
