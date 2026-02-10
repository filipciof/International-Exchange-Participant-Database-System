from main.models import Country, District, Club
from main.serializers import CountrySerializer, DistrictSerializer, ClubSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
)
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from main.permissions import ClubPermission
from main.selectors import club_queryset_for
from django.shortcuts import get_object_or_404


class CountryView(APIView):
    def get(self, request):
        countries = Country.objects.order_by("id")
        serializer = CountrySerializer(countries, many=True)
        return Response(serializer.data)


class DistrictView(APIView):
    def get(self, request):
        districts = District.objects.order_by("id")

        country = request.query_params.get("country")
        if country:
            districts = districts.filter(id_country=country)

        serializer = DistrictSerializer(districts, many=True)
        return Response(serializer.data)


class ClubView(APIView):
    permission_classes = [ClubPermission]

    def get(self, request):
        clubs = club_queryset_for(request.user).order_by("-id")

        id = request.query_params.get("id")
        if id:
            club = clubs.get(id=id)
            serializer = ClubSerializer(club)
            return Response(serializer.data)

        id_district = request.query_params.get("id_district")
        if id_district:
            clubs = clubs.filter(id_district=id_district)

        search = request.query_params.get("search")
        if search:
            search_query = Q()
            search_fields = [
                "name",
                "city",
            ]

            for field in search_fields:
                search_query |= Q(**{f"{field}__icontains": search})

            clubs = clubs.filter(search_query)

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

    def post(self, request):
        data = request.data.copy()
        serializer = ClubSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        club = get_object_or_404(Club, pk=pk, is_active=True)
        self.check_object_permissions(request, club)

        data = request.data.copy()
        serializer = ClubSerializer(club, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        club = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        club = get_object_or_404(Club, pk=pk, is_active=True)
        self.check_object_permissions(request, club)
        club.is_active = False
        club.save(update_fields=["is_active"])
        return Response(status=HTTP_204_NO_CONTENT)
