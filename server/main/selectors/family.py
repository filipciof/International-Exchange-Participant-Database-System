from django.db.models import Q
from main.models import Family
from main.permissions import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
)


def family_queryset_for(user):
    qs = Family.objects.filter(is_active=True)

    if is_admin(user) or is_correspondent(user) or is_kwm_officer(user):
        return qs

    if is_club_officer(user):
        club = user.id_staff.id_club
        return qs.filter(id_club=club)

    if is_student(user):
        student = user.id_student
        return qs.filter(
            Q(exchangefamily__is_active=True)
            & Q(exchangefamily__id_exchange__is_active=True)
            & Q(exchangefamily__id_exchange__id_student=student)
        ).distinct()

    return qs.none()
