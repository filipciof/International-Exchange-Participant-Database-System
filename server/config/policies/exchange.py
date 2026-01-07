from config.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_staff,
    is_student,
)
from config.policies.fail_closed import fail_closed


@fail_closed()
def can_view(user, exchange) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (
            is_club_officer(user)
            and (
                exchange.id_sending_club == user.id_staff.id_club
                or exchange.id_receiving_club == user.id_staff.id_club
                or exchange.id_counsellor.id_club == user.id_staff.id_club
                or exchange.id_kwm_officer.id_club == user.id_staff.id_club
            )
        )
        or (is_student(user) and (exchange.id_student == user.id_student))
    )


@fail_closed()
def can_edit(user, exchange, data=None) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (
            is_club_officer(user)
            and (
                exchange.id_sending_club == user.id_staff.id_club
                or exchange.id_receiving_club == user.id_staff.id_club
                or exchange.id_counsellor.id_club == user.id_staff.id_club
                or exchange.id_kwm_officer.id_club == user.id_staff.id_club
            )
        )
    )


@fail_closed()
def can_delete(user, exchange) -> bool:
    return can_edit(user, exchange, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    return is_staff(user)
