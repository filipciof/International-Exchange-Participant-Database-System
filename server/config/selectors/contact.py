from contacts.models import Contact
from config.permissions.base import (
    Roles,
    get_active_role,
    is_staff,
)


def contact_queryset_for(request):
    user = request.user
    qs = Contact.objects.filter(is_active=True)
    active_role = get_active_role(request)

    if active_role in (Roles.ADMIN, Roles.CORRESPONDENT, Roles.KWM_OFFICER, Roles.CLUB_OFFICER):
        return qs
    if active_role is not None:
        return qs.none()

    # Fallback: original cascading behavior
    if is_staff(user):
        return qs

    return qs.none()
