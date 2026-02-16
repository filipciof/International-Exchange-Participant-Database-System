from main.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
)
from main.policies.fail_closed import fail_closed
from main.models import Country


@fail_closed()
def can_view(user, district) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
    )


@fail_closed()
def can_edit(user, district, data=None) -> bool:
    return is_admin(user) or is_correspondent(user) or is_kwm_officer(user)


@fail_closed()
def can_delete(user, district) -> bool:
    return can_edit(user, district, None)


@fail_closed()
def can_create(user, data=None) -> bool:
    if not (is_admin(user) or is_correspondent(user) or is_kwm_officer(user)):
        return False

    # Non-admins cannot create districts in home country
    if not is_admin(user) and data and "id_country" in data:
        country = Country.objects.filter(id=data["id_country"]).first()
        if country and country.is_home_country:
            return False

    return True
