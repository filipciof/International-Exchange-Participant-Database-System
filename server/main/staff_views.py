from .models import Staff
from .serializers import StaffSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
)
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from config.settings import MEDIA_ROOT
import os
from uuid import uuid4
from django.core.files.storage import default_storage

User = get_user_model()

get_allowed_groups = ["admin", "correspondent", "club_officer", "kwm_officer"]
crud_allowed_groups = ["admin", "correspondent"]


class StaffView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        staff = Staff.objects.order_by("-id")
        staff = staff.filter(is_active=True)

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
        user_groups = request.user.groups.values_list("name", flat=True)
        is_admin_user = bool(set(user_groups).intersection(crud_allowed_groups))
        is_staff_user = bool(set(user_groups).intersection(get_allowed_groups))
        me = request.query_params.get("me")

        # Check if user is creating their own profile
        if me and me.lower() in ("true", "1"):
            if not is_staff_user:
                return Response(
                    {"message": "You are not authorized to do this."},
                    status=HTTP_403_FORBIDDEN,
                )

            # Check if they already have a staff profile
            existing_staff = Staff.objects.filter(
                id_user=request.user, is_active=True
            ).first()
            if existing_staff:
                return Response(
                    {"message": "You already have a staff profile."},
                    status=HTTP_400_BAD_REQUEST,
                )

            data = request.data.copy()
            # Auto-assign id_user
            data["id_user"] = request.user.id

        else:
            # Creating another staff member's profile - admin only
            if not is_admin_user:
                return Response(
                    {"message": "You are not authorized to do this."},
                    status=HTTP_403_FORBIDDEN,
                )

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
        user_groups = request.user.groups.values_list("name", flat=True)
        is_admin_user = bool(set(user_groups).intersection(crud_allowed_groups))
        is_staff_user = bool(set(user_groups).intersection(get_allowed_groups))
        me = request.query_params.get("me")

        # Check if user is updating their own profile
        if me and me.lower() in ("true", "1"):
            if not is_staff_user:
                return Response(
                    {"message": "You are not authorized to do this."},
                    status=HTTP_403_FORBIDDEN,
                )

            # Get their own staff profile
            try:
                staff = Staff.objects.get(id_user=request.user, is_active=True)
            except Staff.DoesNotExist:
                return Response(
                    {"message": "Staff profile not found for this user."},
                    status=HTTP_404_NOT_FOUND,
                )

            data = request.data.copy()
            # Prevent changing id_user
            if "id_user" in data:
                del data["id_user"]

        else:
            # Updating another staff member's profile - admin only
            if not is_admin_user:
                return Response(
                    {"message": "You are not authorized to do this."},
                    status=HTTP_403_FORBIDDEN,
                )

            try:
                staff = Staff.objects.get(pk=pk, is_active=True)
            except Staff.DoesNotExist:
                return Response({"message": "Staff not found."}, status=HTTP_404_NOT_FOUND)

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
        updated = Staff.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Staff not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)


class StaffPhotoView(APIView):
    def get(self, request) -> Response | HttpResponse:
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

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
    """View for managing staff user accounts (create/update)"""

    def post(self, request, pk=None):
        """Create a user account for a staff member"""
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            staff = Staff.objects.get(pk=pk, is_active=True)
        except Staff.DoesNotExist:
            return Response(
                {"message": "Staff not found."}, status=HTTP_404_NOT_FOUND
            )

        # Check if staff already has a user account
        if staff.id_user:
            return Response(
                {"message": "Staff member already has a user account."},
                status=HTTP_400_BAD_REQUEST,
            )

        email = request.data.get("email")
        password = request.data.get("password")
        group_name = request.data.get("group")

        if not email or not password or not group_name:
            return Response(
                {"message": "Email, password, and group are required."},
                status=HTTP_400_BAD_REQUEST,
            )

        # Check if email is already in use
        if User.objects.filter(email=email).exists():
            return Response(
                {"message": "Email is already in use."},
                status=HTTP_400_BAD_REQUEST,
            )

        # Validate group
        valid_groups = ["admin", "correspondent", "club_officer", "kwm_officer"]
        if group_name not in valid_groups:
            return Response(
                {"message": f"Invalid group. Must be one of: {', '.join(valid_groups)}"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
        )

        # Add user to selected group
        staff_group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(staff_group)

        # Link user to staff
        staff.id_user = user
        staff.save()

        return Response(
            {"message": "User account created successfully.", "email": user.email},
            status=HTTP_201_CREATED,
        )

    def patch(self, request, pk=None):
        """Update a staff member's user account (email/password/group)"""
        user_groups = request.user.groups.values_list("name", flat=True)
        is_staff_user = bool(set(user_groups).intersection(get_allowed_groups))
        is_admin_user = bool(set(user_groups).intersection(crud_allowed_groups))

        if not is_staff_user and not is_admin_user:
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            staff = Staff.objects.get(pk=pk, is_active=True)
        except Staff.DoesNotExist:
            return Response(
                {"message": "Staff not found."}, status=HTTP_404_NOT_FOUND
            )

        if not staff.id_user:
            return Response(
                {"message": "Staff member does not have a user account."},
                status=HTTP_404_NOT_FOUND,
            )

        # If staff user (non-admin), verify they can only edit their own account
        if is_staff_user and not is_admin_user and staff.id_user != request.user:
            return Response(
                {"message": "You can only edit your own user account."},
                status=HTTP_403_FORBIDDEN,
            )

        user = staff.id_user
        email = request.data.get("email")
        password = request.data.get("password")
        group_name = request.data.get("group")

        # Only admins can update groups
        if group_name:
            if not is_admin_user:
                return Response(
                    {"message": "Only admins can update user groups."},
                    status=HTTP_403_FORBIDDEN,
                )

            # Validate group
            valid_groups = ["admin", "correspondent", "club_officer", "kwm_officer"]
            if group_name not in valid_groups:
                return Response(
                    {"message": f"Invalid group. Must be one of: {', '.join(valid_groups)}"},
                    status=HTTP_400_BAD_REQUEST,
                )

            # Update user's groups
            user.groups.clear()
            new_group, _ = Group.objects.get_or_create(name=group_name)
            user.groups.add(new_group)

        # Update email if provided
        if email and email != user.email:
            # Check if new email is already in use
            if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                return Response(
                    {"message": "Email is already in use."},
                    status=HTTP_400_BAD_REQUEST,
                )
            user.email = email
            user.username = email

        # Update password if provided
        if password:
            user.set_password(password)

        user.save()

        return Response(
            {"message": "User account updated successfully.", "email": user.email}
        )
