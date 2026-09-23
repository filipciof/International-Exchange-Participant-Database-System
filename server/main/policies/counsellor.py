from main.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
)

from main.policies.fail_closed import fail_closed


@fail_closed()
def can_view(user, counsellor) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or (is_club_officer(user) and counsellor.id_club == user.id_staff.id_club)
    )


@fail_closed()
def can_edit(user, counsellor, data=None) -> bool:
    return is_admin(user) or (
        is_club_officer(user) and counsellor.id_club == user.id_staff.id_club
    )


@fail_closed()
def can_delete(user, counsellor) -> bool:
    return is_admin(user) or (
        is_club_officer(user) and counsellor.id_club == user.id_staff.id_club
    )


@fail_closed()
def can_create(user, data=None) -> bool:
    return is_admin(user) or is_club_officer(user)
