from config.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
    is_any,
    student_has_exchange_with_club,
)
from config.policies.fail_closed import fail_closed


@fail_closed()
def _can_club_officer_do(user, document) -> bool:
    return (
        document.id_staff == user.id_staff
        or document.id_club == user.id_staff.id_club
        or document.id_family.id_club == user.id_staff.id_club
        or student_has_exchange_with_club(
            student=document.id_student, club=user.id_staff.id_club
        )
    )


@fail_closed()
def can_view(user, document) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (is_club_officer(user) and _can_club_officer_do(user, document))
        or (is_student(user) and document.id_student == user.id_student)
    )


@fail_closed()
def can_edit(user, document, data=None) -> bool:
    can_edit_doc = (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (is_club_officer(user) and _can_club_officer_do(user, document))
        or (is_student(user) and document.id_student == user.id_student)
    )

    if not can_edit_doc:
        return False

    # Students can only edit documents where they remain the sole owner
    if is_student(user) and data:
        # Check if any ownership fields are being modified
        if any(key in data for key in ["id_student", "id_staff", "id_club", "id_family", "id_district"]):
            return (
                data.get("id_student", document.id_student) == user.id_student
                and data.get("id_staff", document.id_staff) is None
                and data.get("id_club", document.id_club) is None
                and data.get("id_family", document.id_family) is None
                and data.get("id_district", document.id_district) is None
            )

    return True


@fail_closed()
def can_delete(user, document) -> bool:
    return can_edit(user, document, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    if not is_any(user):
        return False

    # Students can only create documents for themselves with no other ownership
    if is_student(user) and data:
        return (
            data.get("id_student") == user.id_student
            and data.get("id_staff") is None
            and data.get("id_club") is None
            and data.get("id_family") is None
            and data.get("id_district") is None
        )

    return True
