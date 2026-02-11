from django.utils.translation import gettext as _
from django_filters import rest_framework as filters
from django.db.models import Q
from django.db import transaction
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.http import FileResponse
from rest_framework.generics import (
    GenericAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from main.models import Club, Staff
from main.serializers import (
    CreateStaffSerializer,
    StaffSerializer,
    StaffUserAccountUpdateSerializer,
)
from main.permissions import StaffPermission
from main.selectors import staff_queryset_for
from django.shortcuts import get_object_or_404
from eauth.utils import send_activation_email, send_email_change_verification


User = get_user_model()


class StaffFilter(filters.FilterSet):
    search = filters.CharFilter(method="filter_search")

    class Meta:
        model = Staff
        fields = []

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value)
            | Q(middle_name__icontains=value)
            | Q(last_name__icontains=value)
            | Q(phone__icontains=value)
            | Q(email__icontains=value)
        )


class StaffListView(ListCreateAPIView):
    serializer_class = StaffSerializer
    permission_classes = [StaffPermission]
    filterset_class = StaffFilter

    def get_queryset(self):
        return staff_queryset_for(self.request.user).order_by("-id")

    def create(self, request, *args, **kwargs):
        serializer = CreateStaffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        club = Club.objects.get(id=data["id_club"], is_active=True)

        with transaction.atomic():
            user = User.objects.create_user(email=data["email"], password=None)
            user.set_unusable_password()
            user.save(update_fields=["password"])

            for name in data["groups"]:
                group = Group.objects.get(name=name)
                user.groups.add(group)

            staff = Staff.objects.create(
                id_user=user,
                id_club=club,
                first_name=data["first_name"],
                last_name=data["last_name"],
                is_active=True,
            )

        send_activation_email(user)

        response_serializer = StaffSerializer(staff)
        return Response(response_serializer.data, status=HTTP_201_CREATED)


class StaffDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = StaffSerializer
    permission_classes = [StaffPermission]
    queryset = Staff.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        if instance.id_user:
            instance.id_user.is_active = False
            instance.id_user.save(update_fields=["is_active"])
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class StaffMeView(GenericAPIView):
    serializer_class = StaffSerializer
    permission_classes = [StaffPermission]

    def get_object(self):
        return get_object_or_404(Staff, id_user=self.request.user, is_active=True)

    def get(self, request):
        staff = self.get_object()
        serializer = self.get_serializer(staff)
        return Response(serializer.data)

    def patch(self, request):
        staff = self.get_object()
        self.check_object_permissions(request, staff)
        serializer = self.get_serializer(staff, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StaffPhotoView(GenericAPIView):
    permission_classes = [StaffPermission]
    queryset = Staff.objects.filter(is_active=True)

    def get(self, request, pk):
        staff = self.get_object()
        if not staff.photo:
            return FileResponse(status=404)
        return FileResponse(staff.photo.open())


class StaffUserAccountView(GenericAPIView):
    permission_classes = [StaffPermission]
    queryset = Staff.objects.filter(is_active=True)

    def patch(self, request, pk):
        staff = self.get_object()

        if not staff.id_user:
            return Response(
                {"message": _("Staff member does not have a user account.")},
                status=HTTP_404_NOT_FOUND,
            )

        user = staff.id_user

        serializer = StaffUserAccountUpdateSerializer(
            data=request.data,
            context={"user": user},
        )
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        group_names = serializer.validated_data.get("groups")

        if group_names:
            user.groups.clear()
            for name in group_names:
                group = Group.objects.get(name=name)
                user.groups.add(group)

        email_verification_sent = False
        if email and email != user.email:
            send_email_change_verification(user, email)
            email_verification_sent = True

        return Response(
            {
                "message": _("User account updated successfully."),
                "email": user.email,
                "email_verification_sent": email_verification_sent,
            }
        )
