from django.db.models import Q
from main.models import Student
from main.permissions import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
)


def student_queryset_for(user):
    qs = Student.objects.filter(is_active=True)

    if is_admin(user) or is_correspondent(user) or is_kwm_officer(user):
        return qs

    if is_club_officer(user):
        club = user.id_staff.id_club
        return qs.filter(
            Q(exchange__is_active=True)
            & (
                Q(exchange__id_receiving_club=club)
                | Q(exchange__id_sending_club=club)
                | Q(exchange__id_counsellor__id_club=club)
                | Q(exchange__id_kwm_officer__id_club=club)
            )
        ).distinct()

    return qs.none()
