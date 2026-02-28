from django.db.models import Q


class Roles:
    ADMIN = "admin"
    CORRESPONDENT = "correspondent"
    KWM_OFFICER = "kwm_officer"
    CLUB_OFFICER = "club_officer"
    STUDENT = "student"


def has_role(user, role) -> bool:
    return user.groups.filter(name=role).exists()


def is_admin(user) -> bool:
    return has_role(user, Roles.ADMIN)


def is_correspondent(user) -> bool:
    return has_role(user, Roles.CORRESPONDENT)


def is_kwm_officer(user) -> bool:
    return has_role(user, Roles.KWM_OFFICER)


def is_club_officer(user) -> bool:
    return has_role(user, Roles.CLUB_OFFICER)


def is_staff(user) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or is_club_officer(user)
    )


def is_student(user) -> bool:
    return has_role(user, Roles.STUDENT)


def is_any(user) -> bool:
    return (
        is_admin(user)
        or is_correspondent(user)
        or is_kwm_officer(user)
        or is_club_officer(user)
        or is_student(user)
    )


def student_has_exchange_with_club(student, club) -> bool:
    return student.exchange_set.filter(
        Q(is_active=True)
        & (
            Q(id_receiving_club=club)
            | Q(id_sending_club=club)
            | Q(id_counsellor__id_club=club)
            | Q(id_kwm_officer__id_club=club)
        )
    ).exists()


def student_has_exchange_with_staff(student, staff) -> bool:
    return student.exchange_set.filter(
        Q(is_active=True) & (Q(id_counsellor=staff) | Q(id_kwm_officer=staff))
    ).exists()


def student_has_exchange_with_family(student, family) -> bool:
    return student.exchange_set.filter(
        Q(is_active=True)
        & Q(
            exchangefamily__is_active=True,
            exchangefamily__id_family=family,
        )
    ).exists()


def get_active_role(request) -> str | None:
    role = request.headers.get("X-Active-Role")
    if role and has_role(request.user, role):
        return role
    return None


def is_club_from_home_country(club) -> bool:
    """Check if a club belongs to the home country"""
    if not club or not club.id_district or not club.id_district.id_country:
        return False
    return club.id_district.id_country.is_home_country
