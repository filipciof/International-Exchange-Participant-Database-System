from django.db.models import Q
from main.models import Document
from config.permissions.base import (
    Roles,
    get_active_role,
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_student,
)


def document_queryset_for(request):
    user = request.user
    qs = Document.objects.filter(is_active=True)
    active_role = get_active_role(request)

    if active_role in (Roles.ADMIN, Roles.CORRESPONDENT, Roles.KWM_OFFICER):
        return qs
    if active_role == Roles.CLUB_OFFICER:
        club = user.id_staff.id_club
        return qs.filter(
            Q(id_staff=user.id_staff)
            | Q(id_club=club)
            | Q(id_family__id_club=club)
            | (
                Q(id_student__exchange__is_active=True)
                & (
                    Q(id_student__exchange__id_receiving_club=club)
                    | Q(id_student__exchange__id_sending_club=club)
                    | Q(id_student__exchange__id_counsellor__id_club=club)
                    | Q(id_student__exchange__id_kwm_officer__id_club=club)
                )
            )
        ).distinct()
    if active_role == Roles.STUDENT:
        return qs.filter(id_student=user.id_student)
    if active_role is not None:
        return qs.none()

    # Fallback: original cascading behavior
    if is_admin(user) or is_correspondent(user) or is_kwm_officer(user):
        return qs

    if is_club_officer(user):
        club = user.id_staff.id_club
        return qs.filter(
            Q(id_staff=user.id_staff)
            | Q(id_club=club)
            | Q(id_family__id_club=club)
            | (
                Q(id_student__exchange__is_active=True)
                & (
                    Q(id_student__exchange__id_receiving_club=club)
                    | Q(id_student__exchange__id_sending_club=club)
                    | Q(id_student__exchange__id_counsellor__id_club=club)
                    | Q(id_student__exchange__id_kwm_officer__id_club=club)
                )
            )
        ).distinct()

    if is_student(user):
        return qs.filter(id_student=user.id_student)

    return qs.none()
