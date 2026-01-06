from django.db.models import Q
from main.models import Club
from config.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
)


def club_queryset_for(user):
    qs = Club.objects.filter(is_active=True)

    if is_admin(user) or is_correspondent(user) or is_kwm_officer(user):
        return qs

    if is_club_officer(user):
        club = user.id_staff.id_club
        return qs.filter(id=club.id)

    if is_student(user):
        student = user.id_student
        return qs.filter(
            Q(received_exchange__is_active=True, received_exchange__id_student=student)
            | Q(sent_exchange__is_active=True, sent_exchange__id_student=student)
            | Q(staff__exchange_counsellor__is_active=True, staff__exchange_counsellor__id_student=student)
            | Q(staff__exchange_kwm_officer__is_active=True, staff__exchange_kwm_officer__id_student=student)
        ).distinct()

    return qs.none()
