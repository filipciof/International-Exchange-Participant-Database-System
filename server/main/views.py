from .models import (
    Club,
    Document,
    ExchangeFamily,
    Family,
    FamilyMember,
    Country,
    District,
    Exchange,
    ExchangeType,
    Staff,
    Student,
)
from .serializers import (
    ClubSerializer,
    DocumentSerializer,
    ExchangeFamilySerializer,
    FamilySerializer,
    FamilyMemberSerializer,
    CountrySerializer,
    DistrictSerializer,
    ExchangeTypeSerializer,
    ExchangeSerializer,
)
from django.http import Http404
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
from config.permissions.policy_permissions import (
    ClubPermission,
    DocumentPermission,
    ExchangeFamilyPermission,
    ExchangePermission,
    FamilyMemberPermission,
    FamilyPermission,
)
from config.selectors.club import club_queryset_for
from config.selectors.document import document_queryset_for
from config.selectors.exchange_family import exchange_family_queryset_for
from config.selectors.exchange import exchange_queryset_for
from config.selectors.family_member import family_member_queryset_for
from config.selectors.family import family_queryset_for
from django.shortcuts import get_object_or_404


def not_found_view(request):
    raise Http404("Not Found")


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


class FamilyView(APIView):
    permission_classes = [FamilyPermission]

    def get(self, request):
        families = family_queryset_for(request.user).order_by("-id")

        id = request.query_params.get("id")
        if id:
            family = families.get(id=id)
            serializer = FamilySerializer(family)
            return Response(serializer.data)

        id_club = request.query_params.get("id_club")
        if id_club:
            families = families.filter(id_club=id_club)

        search = request.query_params.get("search")
        if search:
            search_query = Q()
            search_fields = [
                "name",
                "city",
                "address",
            ]

            for field in search_fields:
                search_query |= Q(**{f"{field}__icontains": search})

            families = families.filter(search_query)

        page = request.query_params.get("page")
        if page:
            paginator = PageNumberPagination()
            paginator.page_size = min(
                int(request.query_params.get("page_size", 25)), 100
            )
            result_page = paginator.paginate_queryset(families, request, view=self)
            serializer = FamilySerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = FamilySerializer(families, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = FamilySerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        family = get_object_or_404(Family, pk=pk, is_active=True)
        self.check_object_permissions(request, family)

        data = request.data.copy()
        serializer = FamilySerializer(family, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        family = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        family = get_object_or_404(Family, pk=pk, is_active=True)
        self.check_object_permissions(request, family)
        family.is_active = False
        family.save(update_fields=["is_active"])
        return Response(status=HTTP_204_NO_CONTENT)


class FamilyMemberView(APIView):
    permission_classes = [FamilyMemberPermission]

    def get(self, request):
        family_members = family_member_queryset_for(request.user).order_by("-id")

        id = request.query_params.get("id")
        if id:
            family_member = family_members.get(id=id)
            serializer = FamilyMemberSerializer(family_member)
            return Response(serializer.data)

        id_family = request.query_params.get("id_family")
        if id_family:
            family_members = family_members.filter(id_family=id_family)
            serializer = FamilyMemberSerializer(family_members, many=True)
            return Response(serializer.data)

        search = request.query_params.get("search")
        if search:
            search_query = Q()
            search_fields = [
                "first_name",
                "middle_name",
                "last_name",
                "email",
                "phone",
                "occupation",
            ]

            for field in search_fields:
                search_query |= Q(**{f"{field}__icontains": search})

            family_members = family_members.filter(search_query)

        page = request.query_params.get("page")
        if page:
            paginator = PageNumberPagination()
            paginator.page_size = min(
                int(request.query_params.get("page_size", 25)), 100
            )
            result_page = paginator.paginate_queryset(
                family_members, request, view=self
            )
            serializer = FamilyMemberSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = FamilyMemberSerializer(family_members, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = FamilyMemberSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        family_member = get_object_or_404(FamilyMember, pk=pk, is_active=True)
        self.check_object_permissions(request, family_member)

        data = request.data.copy()
        serializer = FamilyMemberSerializer(family_member, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        family_member = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        family_member = get_object_or_404(FamilyMember, pk=pk, is_active=True)
        self.check_object_permissions(request, family_member)
        family_member.is_active = False
        family_member.save(update_fields=["is_active"])
        return Response(status=HTTP_204_NO_CONTENT)


class ExchangeTypeView(APIView):
    def get(self, request):
        exchange_types = ExchangeType.objects.order_by("id")
        serializer = ExchangeTypeSerializer(exchange_types, many=True)
        return Response(serializer.data)


class ExchangeView(APIView):
    permission_classes = [ExchangePermission]

    def get(self, request):
        exchanges = exchange_queryset_for(request.user).order_by("-id")

        # Allow filtering by id_student
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
        data = request.data.copy()
        serializer = ExchangeSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        exchange = get_object_or_404(Exchange, pk=pk, is_active=True)
        self.check_object_permissions(request, exchange)

        data = request.data.copy()
        serializer = ExchangeSerializer(exchange, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        exchange = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        exchange = get_object_or_404(Exchange, pk=pk, is_active=True)
        self.check_object_permissions(request, exchange)
        exchange.is_active = False
        exchange.save(update_fields=["is_active"])
        return Response(status=HTTP_204_NO_CONTENT)


class ExchangeFamilyView(APIView):
    permission_classes = [ExchangeFamilyPermission]

    def get(self, request):
        exchange_families = exchange_family_queryset_for(request.user).order_by("-id")

        id_exchange = request.query_params.get("id_exchange")
        if id_exchange:
            exchange_families = exchange_families.filter(id_exchange=id_exchange)

        id_family = request.query_params.get("id_family")
        if id_family:
            exchange_families = exchange_families.filter(id_family=id_family)

        id = request.query_params.get("id")
        if id:
            exchange_family = exchange_families.get(id=id)
            serializer = ExchangeFamilySerializer(exchange_family)
            return Response(serializer.data)

        search = request.query_params.get("search")
        if search:
            search_query = Q()
            search_fields = [
                "id_family__name",
                "id_family__city",
                "id_family__address",
            ]

            for field in search_fields:
                search_query |= Q(**{f"{field}__icontains": search})

            exchange_families = exchange_families.filter(search_query)

        page = request.query_params.get("page")
        if page:
            paginator = PageNumberPagination()
            paginator.page_size = min(
                int(request.query_params.get("page_size", 25)), 100
            )
            result_page = paginator.paginate_queryset(
                exchange_families, request, view=self
            )
            serializer = ExchangeFamilySerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ExchangeFamilySerializer(exchange_families, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = ExchangeFamilySerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        exchange_family = get_object_or_404(ExchangeFamily, pk=pk, is_active=True)
        self.check_object_permissions(request, exchange_family)

        data = request.data.copy()
        serializer = ExchangeFamilySerializer(exchange_family, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        exchange_family = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        exchange_family = get_object_or_404(ExchangeFamily, pk=pk, is_active=True)
        self.check_object_permissions(request, exchange_family)
        exchange_family.is_active = False
        exchange_family.save(update_fields=["is_active"])
        return Response(status=HTTP_204_NO_CONTENT)


class DocumentView(APIView):
    permission_classes = [DocumentPermission]

    def get(self, request):
        documents = document_queryset_for(request.user).order_by("-id")

        id = request.query_params.get("id")
        if id:
            document = documents.get(id=id)
            serializer = DocumentSerializer(document)
            return Response(serializer.data)

        id_student = request.query_params.get("id_student")
        if id_student:
            documents = documents.filter(id_student=id_student)

        id_staff = request.query_params.get("id_staff")
        if id_staff:
            documents = documents.filter(id_staff=id_staff)

        id_club = request.query_params.get("id_club")
        if id_club:
            documents = documents.filter(id_club=id_club)

        id_family = request.query_params.get("id_family")
        if id_family:
            documents = documents.filter(id_family=id_family)

        id_district = request.query_params.get("id_district")
        if id_district:
            documents = documents.filter(id_district=id_district)

        page = request.query_params.get("page")
        if page:
            paginator = PageNumberPagination()
            paginator.page_size = min(
                int(request.query_params.get("page_size", 25)), 100
            )
            result_page = paginator.paginate_queryset(documents, request, view=self)
            serializer = DocumentSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()

        serializer = DocumentSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        document = get_object_or_404(Document, pk=pk)
        self.check_object_permissions(request, document)

        data = request.data.copy()
        serializer = DocumentSerializer(document, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        document = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        document = get_object_or_404(Document, pk=pk)
        self.check_object_permissions(request, document)
        document.is_active = False
        document.save(update_fields=["is_active"])
        return Response(status=HTTP_204_NO_CONTENT)
