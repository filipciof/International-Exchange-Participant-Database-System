from rest_framework.permissions import BasePermission
from main.policies import club as club_policy
from main.policies import document as document_policy
from main.policies import exchange_family as exchange_family_policy
from main.policies import exchange as exchange_policy
from main.policies import family_member as family_member_policy
from main.policies import family as family_policy
from main.policies import staff as staff_policy
from main.policies import student as student_policy
from main.policies import contact as contact_policy


class PolicyPermission(BasePermission):
    policy = None

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in ("GET", "HEAD"):
            return self.policy.can_view(request.user, obj)
        if request.method in ("PUT", "PATCH"):
            return self.policy.can_edit(request.user, obj, request.data)
        if request.method == "DELETE":
            return self.policy.can_delete(request.user, obj)
        return False

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method == "POST":
            return self.policy.can_create(request.user, request.data)
        return True


class ClubPermission(PolicyPermission):
    policy = club_policy


class DocumentPermission(PolicyPermission):
    policy = document_policy


class ExchangeFamilyPermission(PolicyPermission):
    policy = exchange_family_policy


class ExchangePermission(PolicyPermission):
    policy = exchange_policy


class FamilyMemberPermission(PolicyPermission):
    policy = family_member_policy


class FamilyPermission(PolicyPermission):
    policy = family_policy


class StaffPermission(PolicyPermission):
    policy = staff_policy


class StudentPermission(PolicyPermission):
    policy = student_policy


class ContactPermission(PolicyPermission):
    policy = contact_policy
