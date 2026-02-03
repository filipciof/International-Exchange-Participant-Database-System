from .models import Staff
from .serializers import (
    StaffSerializer,
    StaffUserAccountCreateSerializer,
    StaffUserAccountUpdateSerializer,
)
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
)
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from config.settings import MEDIA_ROOT
from config.permissions.policy_permissions import StaffPermission
from config.selectors.staff import staff_queryset_for
from django.shortcuts import get_object_or_404
import os
from uuid import uuid4
from django.core.files.storage import default_storage

User = get_user_model()


class StaffView(APIView):
    permission_classes = [StaffPermission]

    def get(self, request):
        staff = staff_queryset_for(request.user).order_by("-id")

        id = request.query_params.get("id")
        if id:
            staff = staff.get(id=id)
            serializer = StaffSerializer(staff)
            return Response(serializer.data)

        me = request.query_params.get("me")
        if me and me.lower() in ("true", "1"):
            try:
                staff_member = staff.get(id_user=request.user)
                serializer = StaffSerializer(staff_member)
                return Response(serializer.data)
            except Staff.DoesNotExist:
                return Response(
                    {"message": "Staff profile not found for this user."},
                    status=HTTP_404_NOT_FOUND,
                )

        search = request.query_params.get("search")
        if search:
            search_query = Q()
            search_fields = [
                "first_name",
                "middle_name",
                "last_name",
                "phone",
                "email",
            ]

            for field in search_fields:
                search_query |= Q(**{f"{field}__icontains": search})

            staff = staff.filter(search_query)

        page = request.query_params.get("page")
        if page:
            paginator = PageNumberPagination()
            paginator.page_size = min(
                int(request.query_params.get("page_size", 25)), 100
            )
            result_page = paginator.paginate_queryset(staff, request, view=self)
            serializer = StaffSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = StaffSerializer(staff, many=True)
        return Response(serializer.data)

    def post(self, request):
        me = request.query_params.get("me")

        if me and me.lower() in ("true", "1"):
            existing_staff = Staff.objects.filter(
                id_user=request.user, is_active=True
            ).first()
            if existing_staff:
                return Response(
                    {"message": "You already have a staff profile."},
                    status=HTTP_400_BAD_REQUEST,
                )

            data = request.data.copy()
            data["id_user"] = request.user.id
        else:
            data = request.data.copy()

        photo = request.FILES.get("photo")
        if photo:
            ext = os.path.splitext(photo.name)[1].lower() or ".bin"
            target_name = f"{uuid4().hex}{ext}"
            unique_name = default_storage.get_available_name(target_name)
            photo.name = unique_name
            data["photo"] = photo

        serializer = StaffSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        me = request.query_params.get("me")

        if me and me.lower() in ("true", "1"):
            try:
                staff = Staff.objects.get(id_user=request.user, is_active=True)
            except Staff.DoesNotExist:
                return Response(
                    {"message": "Staff profile not found for this user."},
                    status=HTTP_404_NOT_FOUND,
                )
        else:
            staff = get_object_or_404(Staff, pk=pk, is_active=True)

        self.check_object_permissions(request, staff)
        data = request.data.copy()

        photo = request.FILES.get("photo")
        if photo:
            if staff.photo:
                old_photo_path = os.path.join(MEDIA_ROOT, str(staff.photo))
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)

            ext = os.path.splitext(photo.name)[1].lower() or ".bin"
            target_name = f"{uuid4().hex}{ext}"
            unique_name = default_storage.get_available_name(target_name)
            photo.name = unique_name
            data["photo"] = photo

        serializer = StaffSerializer(staff, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        staff = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        staff = get_object_or_404(Staff, pk=pk, is_active=True)
        self.check_object_permissions(request, staff)

        if staff.id_user:
            staff.id_user.is_active = False
            staff.id_user.save(update_fields=["is_active"])

        staff.is_active = False
        staff.save(update_fields=["is_active"])
        return Response(status=HTTP_204_NO_CONTENT)


class StaffPhotoView(APIView):
    permission_classes = [StaffPermission]

    def get(self, request) -> Response | HttpResponse:
        photo_name = request.query_params.get("photo_name", None)

        if not photo_name:
            return Response(
                {"message": "Photo name not provided."}, status=HTTP_404_NOT_FOUND
            )

        photo_location = os.path.join(MEDIA_ROOT, "staff_photos/", photo_name)

        try:
            with open(photo_location, "rb") as photo:
                photo_data = photo.read()
        except IOError:
            return Response(
                {"message": "Unable to read the photo file."}, status=HTTP_404_NOT_FOUND
            )

        # File download

        # response = HttpResponse(photo_data, content_type="application/octet-stream")
        # response["Content-Disposition"] = f"attachment; filename={photo_name}"
        # return response

        return HttpResponse(photo_data, content_type="image/jpeg")


class StaffUserAccountView(APIView):
    permission_classes = [StaffPermission]

    def post(self, request, pk=None):
        staff = get_object_or_404(Staff, pk=pk, is_active=True)

        if staff.id_user:
            return Response(
                {"message": "Staff member already has a user account."},
                status=HTTP_400_BAD_REQUEST,
            )

        serializer = StaffUserAccountCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        group_names = serializer.validated_data["groups"]

        user = User.objects.create_user(
            email=email,
            password=password,
        )

        for name in group_names:
            group = Group.objects.get(name=name)
            user.groups.add(group)

        staff.id_user = user
        staff.save(update_fields=["id_user"])

        return Response(
            {"message": "User account created successfully.", "email": user.email},
            status=HTTP_201_CREATED,
        )

    def patch(self, request, pk=None):
        staff = get_object_or_404(Staff, pk=pk, is_active=True)
        self.check_object_permissions(request, staff)

        if not staff.id_user:
            return Response(
                {"message": "Staff member does not have a user account."},
                status=HTTP_404_NOT_FOUND,
            )

        user = staff.id_user

        serializer = StaffUserAccountUpdateSerializer(
            data=request.data,
            context={"user": user},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        email = serializer.validated_data.get("email")
        password = serializer.validated_data.get("password")
        group_names = serializer.validated_data.get("groups")

        if group_names:
            user.groups.clear()
            for name in group_names:
                group = Group.objects.get(name=name)
                user.groups.add(group)

        if email and email != user.email:
            user.email = email

        if password:
            user.set_password(password)

        user.save()

        return Response(
            {"message": "User account updated successfully.", "email": user.email}
        )
