from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_403_FORBIDDEN,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
)
from config.settings import MEDIA_ROOT
import os
from django.http import HttpResponse
from .models import Contact, ContactDistrict
from .serializers import ContactSerializer
from uuid import uuid4
from django.core.files.storage import default_storage
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

get_allowed_groups = ["admin", "correspondent", "club_officer", "kwm_officer"]
crud_allowed_groups = ["admin", "correspondent"]


class ContactPhotoView(APIView):
    def get(self, request, format=None):
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

        photo_location = os.path.join(MEDIA_ROOT, "contact_photos/", photo_name)

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


class ContactView(APIView):
    def get(self, request, format=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        contacts = Contact.objects.order_by("-id")
        contacts = contacts.filter(is_active=True)

        id = request.query_params.get("id")
        if id:
            contact = contacts.get(id=id)
            serializer = ContactSerializer(contact)
            return Response(serializer.data)

        country = request.query_params.get("country")
        if country:
            contacts = contacts.filter(id_country=country)

        groups = request.query_params.getlist("group")
        if groups:
            group_query = Q()

            for group in groups:
                if group == "lt":
                    group_query |= Q(is_longterm=True)
                elif group == "f2f":
                    group_query |= Q(is_family_to_family=True)
                elif group == "camp":
                    group_query |= Q(is_camp=True)
                elif group == "none":
                    group_query |= Q(
                        is_longterm=False, is_family_to_family=False, is_camp=False
                    )

            contacts = contacts.filter(group_query)

        search = request.query_params.get("search")
        if search:
            search_query = Q()

            search_fields = [
                "first_name",
                "middle_name",
                "last_name",
                "email",
                "phone",
                "notes",
            ]

            for field in search_fields:
                search_query |= Q(**{f"{field}__icontains": search})

            contacts = contacts.filter(search_query)

        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        result_page = paginator.paginate_queryset(contacts, request, view=self)
        serializer = ContactSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
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

        serializer = ContactSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        contact = serializer.save()
        id_districts = data.getlist("id_districts[]", [])
        for id_district in id_districts:
            ContactDistrict.objects.create(
                id_contact=contact, id_district_id=id_district
            )

        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            contact = Contact.objects.get(pk=pk, is_active=True)
        except Contact.DoesNotExist:
            return Response(
                {"message": "Contact not found."}, status=HTTP_404_NOT_FOUND
            )

        data = request.data.copy()

        photo = request.FILES.get("photo")
        if photo:
            if contact.photo:
                old_photo_path = os.path.join(MEDIA_ROOT, str(contact.photo))
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)

            ext = os.path.splitext(photo.name)[1].lower() or ".bin"
            target_name = f"{uuid4().hex}{ext}"
            unique_name = default_storage.get_available_name(target_name)
            photo.name = unique_name
            data["photo"] = photo

        serializer = ContactSerializer(contact, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        contact = serializer.save()

        id_districts = data.getlist("id_districts[]", None)
        if id_districts is not None:
            ContactDistrict.objects.filter(id_contact=contact).delete()

            for id_district in id_districts:
                ContactDistrict.objects.create(
                    id_contact=contact, id_district_id=id_district
                )

        return Response(serializer.data)

    def delete(self, request, pk=None):
        updated = Contact.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Contact not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)
