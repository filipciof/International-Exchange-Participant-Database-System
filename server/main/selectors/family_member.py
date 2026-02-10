from django.db.models import Q
from main.models import FamilyMember
from main.permissions import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
)


def family_member_queryset_for(user):
    qs = FamilyMember.objects.filter(is_active=True)

    if is_admin(user) or is_correspondent(user) or is_kwm_officer(user):
        return qs

    if is_club_officer(user):
        club = user.id_staff.id_club
        return qs.filter(id_family__id_club=club)

    if is_student(user):
        student = user.id_student
        return qs.filter(
            Q(id_family__exchangefamily__is_active=True)
            & Q(id_family__exchangefamily__id_exchange__is_active=True)
            & Q(id_family__exchangefamily__id_exchange__id_student=student)
        ).distinct()

    return qs.none()
