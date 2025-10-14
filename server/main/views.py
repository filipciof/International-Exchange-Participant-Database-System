from django.shortcuts import render
from rest_framework import viewsets
from .models import Club, Family, Student
from .serializers import ClubSerializer, FamilySerializer, StudentSerializer
from django.http import Http404


def not_found_view(request):
    raise Http404("Not Found")


class ClubViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer


class FamilyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer


class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
