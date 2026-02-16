from django.db.models import Q
from main.models import District
from main.permissions import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
)


def district_queryset_for(user):
    qs = District.objects.filter(is_active=True)

    if is_admin(user) or is_correspondent(user) or is_kwm_officer(user):
        return qs

    if is_club_officer(user):
        district = user.id_staff.id_club.id_district
        if district:
            return qs.filter(id=district.id)
        return qs.none()

    if is_student(user):
        student = user.id_student
        return qs.filter(
            Q(club__received_exchange__is_active=True, club__received_exchange__id_student=student)
            | Q(club__sent_exchange__is_active=True, club__sent_exchange__id_student=student)
            | Q(club__staff__exchange_counsellor__is_active=True, club__staff__exchange_counsellor__id_student=student)
            | Q(club__staff__exchange_kwm_officer__is_active=True, club__staff__exchange_kwm_officer__id_student=student)
        ).distinct()

    return qs.none()
