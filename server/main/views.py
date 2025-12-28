from .models import (
    Club,
    Family,
    Country,
    District,
    Exchange,
    ExchangeType,
    Staff,
)
from .serializers import (
    ClubSerializer,
    FamilySerializer,
    CountrySerializer,
    DistrictSerializer,
    ExchangeTypeSerializer,
    ExchangeSerializer,
    StaffSerializer,
)
from django.http import Http404, HttpResponse
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

get_allowed_groups = ["admin", "correspondent", "club_officer", "kwm_officer"]
crud_allowed_groups = ["admin", "correspondent"]


def not_found_view(request):
    raise Http404("Not Found")


class CountryView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        countries = Country.objects.order_by("id")
        serializer = CountrySerializer(countries, many=True)
        return Response(serializer.data)


class DistrictView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        districts = []
        country = request.query_params.get("country")

        if country:
            districts = District.objects.filter(id_country=country)

        serializer = DistrictSerializer(districts, many=True)
        return Response(serializer.data)


class ClubView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        clubs = Club.objects.order_by("-id")
        page = request.query_params.get("page")

        if page:
            paginator = PageNumberPagination()
            paginator.page_size = min(
                int(request.query_params.get("page_size", 25)), 100
            )
            result_page = paginator.paginate_queryset(clubs, request, view=self)
            serializer = ClubSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ClubSerializer(clubs, many=True)
        return Response(serializer.data)


class FamilyView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        families = Family.objects.order_by("-id")
        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        result_page = paginator.paginate_queryset(families, request, view=self)
        serializer = FamilySerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class ExchangeTypeView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        exchange_types = ExchangeType.objects.order_by("id")
        serializer = ExchangeTypeSerializer(exchange_types, many=True)
        return Response(serializer.data)


class ExchangeView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        exchanges = Exchange.objects.order_by("-id")
        exchanges = exchanges.filter(is_active=True)
        id_student = request.query_params.get("id_student")

        if id_student:
            exchanges = exchanges.filter(id_student=id_student)

        page = request.query_params.get("page")

        if page:
            paginator = PageNumberPagination()
            paginator.page_size = min(
                int(request.query_params.get("page_size", 25)), 100
            )
            result_page = paginator.paginate_queryset(exchanges, request, view=self)
            serializer = ExchangeSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ExchangeSerializer(exchanges, many=True)
        return Response(serializer.data)

    def post(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        serializer = ExchangeSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def delete(self, request, pk=None):
        updated = Exchange.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Exchange not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)

    def patch(self, request, pk=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            exchange = Exchange.objects.get(pk=pk, is_active=True)
        except Exchange.DoesNotExist:
            return Response(
                {"message": "Exchange not found."}, status=HTTP_404_NOT_FOUND
            )

        data = request.data.copy()
        serializer = ExchangeSerializer(exchange, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        exchange = serializer.save()
        return Response(serializer.data)


class StaffView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        staff = Staff.objects.order_by("-id")
        search = request.query_params.get("search")

        id = request.query_params.get("id")

        if id:
            staff = staff.get(id=id)
            serializer = StaffSerializer(staff)
            return Response(serializer.data)

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

        serializer = StaffSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
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
