from django.shortcuts import render
from rest_framework import viewsets
from .models import Club, Family, Student, Country, District
from .serializers import (
    ClubSerializer,
    FamilySerializer,
    StudentSerializer,
    CountrySerializer,
    DistrictSerializer,
)
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_403_FORBIDDEN
from rest_framework.pagination import PageNumberPagination

allowed_groups = ["admin", "correspondent", "club_officer", "kwm_officer"]


def not_found_view(request):
    raise Http404("Not Found")


class CountryView(APIView):
    def get(self, request, format=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(allowed_groups):
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

        if not set(user_groups).intersection(allowed_groups):
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

        if not set(user_groups).intersection(allowed_groups):
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

        if not set(user_groups).intersection(allowed_groups):
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

        if not set(user_groups).intersection(allowed_groups):
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
