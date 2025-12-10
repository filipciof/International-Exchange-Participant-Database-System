from django.shortcuts import render
from rest_framework import viewsets
from .models import Club, Family, Student, Country, District, Exchange
from .serializers import (
    ClubSerializer,
    FamilySerializer,
    StudentSerializer,
    CountrySerializer,
    DistrictSerializer,
    ExchangeSerializer,
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
from config.settings import MEDIA_ROOT
import os
from uuid import uuid4
from django.core.files.storage import default_storage
from django.db.models import Q

get_allowed_groups = ["admin", "correspondent", "club_officer", "kwm_officer"]
crud_allowed_groups = ["admin", "correspondent"]


def not_found_view(request):
    raise Http404("Not Found")


class CountryView(APIView):
    def get(self, request, format=None):
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
    def get(self, request, format=None):
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
    def get(self, request, format=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        clubs = Club.objects.order_by("-id")
        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        result_page = paginator.paginate_queryset(clubs, request, view=self)
        serializer = ClubSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class FamilyView(APIView):
    def get(self, request, format=None):
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


class StudentView(APIView):
    def get(self, request, format=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        students = Student.objects.order_by("-id")
        students = students.filter(is_active=True)
        id = request.query_params.get("id")

        if id:
            student = students.get(id=id)
            serializer = StudentSerializer(student)
            return Response(serializer.data)

        search = request.query_params.get("search")

        if search:
            search_query = Q()
            search_fields_param = request.query_params.getlist("search_field")

            if search_fields_param:
                search_fields = search_fields_param
            else:
                search_fields = [
                    "first_name",
                    "middle_name",
                    "last_name",
                    "nick_name",
                    "city_of_birth",
                    "city_of_residence",
                    "address",
                    "dietary_restrictions",
                    "first_language",
                    "second_language",
                    "third_language",
                    "passport_number",
                    "first_parent_full_name",
                    "first_parent_email",
                    "second_parent_full_name",
                    "second_parent_email",
                    "polish_phone_number",
                    "insurance_company",
                    "insurance_type",
                    "insurance_serial_number",
                    "notes",
                ]

            for field in search_fields:
                search_query |= Q(**{f"{field}__icontains": search})

            students = students.filter(search_query)

        genders = request.query_params.getlist("gender")
        if genders:
            gender_query = Q()
            for gender in genders:
                try:
                    gender_value = int(gender)
                    gender_query |= Q(gender=gender_value)
                except (ValueError, TypeError):
                    pass
            if gender_query:
                students = students.filter(gender_query)

        shirt_sizes = request.query_params.getlist("shirt_size")
        if shirt_sizes:
            shirt_size_query = Q()
            for size in shirt_sizes:
                shirt_size_query |= Q(shirt_size=size)
            students = students.filter(shirt_size_query)

        country_of_birth = request.query_params.get("country_of_birth")
        country_of_departure = request.query_params.get("country_of_departure")
        country_of_passport = request.query_params.get("country_of_passport")

        if country_of_birth:
            students = students.filter(id_country_of_birth=country_of_birth)

        if country_of_departure:
            students = students.filter(id_country_of_departure=country_of_departure)

        if country_of_passport:
            students = students.filter(id_country_of_passport=country_of_passport)

        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        result_page = paginator.paginate_queryset(students, request, view=self)
        serializer = StudentSerializer(result_page, many=True)
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

        serializer = StudentSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def delete(self, request, pk=None):
        updated = Student.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Student not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)

    def patch(self, request, pk=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            student = Student.objects.get(pk=pk, is_active=True)
        except Student.DoesNotExist:
            return Response(
                {"message": "Student not found."}, status=HTTP_404_NOT_FOUND
            )

        data = request.data.copy()

        photo = request.FILES.get("photo")
        if photo:
            if student.photo:
                old_photo_path = os.path.join(MEDIA_ROOT, str(student.photo))
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)

            ext = os.path.splitext(photo.name)[1].lower() or ".bin"
            target_name = f"{uuid4().hex}{ext}"
            unique_name = default_storage.get_available_name(target_name)
            photo.name = unique_name
            data["photo"] = photo

        serializer = StudentSerializer(student, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        student = serializer.save()
        return Response(serializer.data)


class StudentPhotoView(APIView):
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

        photo_location = os.path.join(MEDIA_ROOT, "student_photos/", photo_name)

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


class ExchangeView(APIView):
    def get(self, request, format=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        exchanges = Exchange.objects.order_by("-id")
        id_student = request.query_params.get("id_student")

        if id_student:
            exchanges = exchanges.filter(id_student=id_student)

        # paginator = PageNumberPagination()
        # paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        # result_page = paginator.paginate_queryset(exchanges, request, view=self)
        # serializer = ExchangeSerializer(result_page, many=True)
        # return paginator.get_paginated_response(serializer.data)
        serializer = ExchangeSerializer(exchanges, many=True)
        return Response(serializer.data)
