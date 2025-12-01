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
from rest_framework.status import HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND
from rest_framework.pagination import PageNumberPagination
from config.settings import MEDIA_ROOT
import os

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
        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        result_page = paginator.paginate_queryset(students, request, view=self)
        serializer = StudentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


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
