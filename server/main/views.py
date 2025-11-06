from django.shortcuts import render
from rest_framework import viewsets
from .models import Club, Family, Student
from .serializers import ClubSerializer, FamilySerializer, StudentSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_403_FORBIDDEN
from rest_framework.pagination import PageNumberPagination

allowed_groups = ["admin", "correspondent", "club_officer", "kwm_officer"]


def not_found_view(request):
    raise Http404("Not Found")


class ClubView(APIView):
    def get(self, request, format=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        clubs = Club.objects.all()
        serializer = ClubSerializer(clubs, many=True)

        return Response(serializer.data)


class FamilyView(APIView):
    def get(self, request, format=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        families = Family.objects.all()
        serializer = FamilySerializer(families, many=True)

        return Response(serializer.data)


class StudentView(APIView):
    def get(self, request, format=None):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        students = Student.objects.all()
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(students, request, view=self)
        serializer = StudentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
        return Response(serializer.data)
