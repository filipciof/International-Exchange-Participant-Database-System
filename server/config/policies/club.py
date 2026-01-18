from config.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
    student_has_exchange_with_club,
    is_club_from_home_country,
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
    # Club officers CANNOT edit clubs
    return is_admin(user) or is_correspondent(user) or is_kwm_officer(user)


@fail_closed()
def can_delete(user, club) -> bool:
    return can_edit(user, club, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    # Correspondents and kwm_officers can create clubs, but with restrictions
    if not (is_admin(user) or is_correspondent(user) or is_kwm_officer(user)):
        return False

    # Non-admins cannot create home country clubs
    if not is_admin(user) and data and "id_district" in data:
        from main.models import District

        district = District.objects.filter(id=data["id_district"]).first()
        if district and district.id_country and district.id_country.is_home_country:
            return False

    return True
