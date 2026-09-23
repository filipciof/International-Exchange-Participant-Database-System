from main.models import Counsellor
from main.permissions import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
)


def counsellor_queryset_for(user):
    qs = Counsellor.objects.filter(is_active=True)

    if is_club_officer(user):
        return qs.filter(id_club=user.id_club)

    if is_admin(user) or is_correspondent(user) or is_kwm_officer(user):
        return qs

    return qs.none()
