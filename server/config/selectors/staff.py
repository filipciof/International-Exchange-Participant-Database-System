from django.db.models import Q
from main.models import Staff
from config.permissions.base import (
    Roles,
    get_active_role,
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
)


def staff_queryset_for(request):
    user = request.user
    qs = Staff.objects.filter(is_active=True)
    active_role = get_active_role(request)

    if active_role in (Roles.ADMIN, Roles.CORRESPONDENT, Roles.KWM_OFFICER):
        return qs
    if active_role == Roles.CLUB_OFFICER:
        return qs
    if active_role == Roles.STUDENT:
        student = user.id_student
        return qs.filter(
            Q(exchange_counsellor__id_student=student, exchange_counsellor__is_active=True)
            | Q(exchange_kwm_officer__id_student=student, exchange_kwm_officer__is_active=True)
        ).distinct()
    if active_role is not None:
        return qs.none()

    # Fallback: original cascading behavior
    if is_admin(user) or is_correspondent(user) or is_kwm_officer(user):
        return qs

    if is_club_officer(user):
        return qs

    if is_student(user):
        student = user.id_student
        return qs.filter(
            Q(exchange_counsellor__id_student=student, exchange_counsellor__is_active=True)
            | Q(exchange_kwm_officer__id_student=student, exchange_kwm_officer__is_active=True)
        ).distinct()

    return qs.none()
