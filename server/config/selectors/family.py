from django.db.models import Q
from main.models import Family
from config.permissions.base import (
    Roles,
    get_active_role,
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
)


def family_queryset_for(request):
    user = request.user
    qs = Family.objects.filter(is_active=True)
    active_role = get_active_role(request)

    if active_role in (Roles.ADMIN, Roles.CORRESPONDENT, Roles.KWM_OFFICER):
        return qs
    if active_role == Roles.CLUB_OFFICER:
        club = user.id_staff.id_club
        return qs.filter(id_club=club)
    if active_role == Roles.STUDENT:
        student = user.id_student
        return qs.filter(
            Q(exchangefamily__is_active=True)
            & Q(exchangefamily__id_exchange__is_active=True)
            & Q(exchangefamily__id_exchange__id_student=student)
        ).distinct()
    if active_role is not None:
        return qs.none()

    # Fallback: original cascading behavior
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
