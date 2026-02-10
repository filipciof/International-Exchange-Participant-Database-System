from main.models import Contact
from main.permissions import is_staff


def contact_queryset_for(user):
    qs = Contact.objects.filter(is_active=True)

    if is_staff(user):
        return qs

    return qs.none()
