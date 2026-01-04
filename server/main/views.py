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

get_allowed_groups = ["admin", "correspondent", "club_officer", "kwm_officer", "staff"]
crud_allowed_groups = ["admin", "correspondent"]


def not_found_view(request):
    raise Http404("Not Found")


class CountryView(APIView):
    def get(self, request):
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
        clubs = clubs.filter(is_active=True)

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
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        serializer = ClubSerializer(data=data)

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
            club = Club.objects.get(pk=pk, is_active=True)
        except Club.DoesNotExist:
            return Response({"message": "Club not found."}, status=HTTP_404_NOT_FOUND)

        data = request.data.copy()
        serializer = ClubSerializer(club, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        club = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        updated = Club.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Club not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)


class FamilyView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        families = Family.objects.order_by("-id")
        families = families.filter(is_active=True)

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
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        serializer = FamilySerializer(data=data)

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
            family = Family.objects.get(pk=pk, is_active=True)
        except Family.DoesNotExist:
            return Response({"message": "Family not found."}, status=HTTP_404_NOT_FOUND)

        data = request.data.copy()
        serializer = FamilySerializer(family, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        family = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        updated = Family.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Family not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)


class FamilyMemberView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        family_members = FamilyMember.objects.order_by("-id")
        family_members = family_members.filter(is_active=True)

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
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        serializer = FamilySerializer(data=data)

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
            family = Family.objects.get(pk=pk, is_active=True)
        except Family.DoesNotExist:
            return Response({"message": "Family not found."}, status=HTTP_404_NOT_FOUND)

        data = request.data.copy()
        serializer = FamilySerializer(family, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        family = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        updated = Family.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Family not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)


class ExchangeTypeView(APIView):
    def get(self, request):
        exchange_types = ExchangeType.objects.order_by("id")
        serializer = ExchangeTypeSerializer(exchange_types, many=True)
        return Response(serializer.data)


class ExchangeView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)
        is_student = "student" in user_groups

        if not is_student and not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        exchanges = Exchange.objects.order_by("-id")
        exchanges = exchanges.filter(is_active=True)

        # If user is a student, only allow them to see their own exchanges
        if is_student:
            try:
                student = Student.objects.get(id_user=request.user, is_active=True)
                exchanges = exchanges.filter(id_student=student.id)
            except Student.DoesNotExist:
                return Response(
                    {"message": "Student profile not found for this user."},
                    status=HTTP_404_NOT_FOUND,
                )
        else:
            # For staff/admin users, allow filtering by id_student
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


class ExchangeFamilyView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)
        is_student = "student" in user_groups

        if not is_student and not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        exchange_families = ExchangeFamily.objects.order_by("-id")
        exchange_families = exchange_families.filter(is_active=True)

        # If user is a student, only allow them to see exchange families related to their exchanges
        if is_student:
            try:
                student = Student.objects.get(id_user=request.user, is_active=True)
                exchange_families = exchange_families.filter(
                    id_exchange__id_student=student.id
                )
            except Student.DoesNotExist:
                return Response(
                    {"message": "Student profile not found for this user."},
                    status=HTTP_404_NOT_FOUND,
                )

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
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        serializer = ExchangeFamilySerializer(data=data)

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
            exchange_family = ExchangeFamily.objects.get(pk=pk, is_active=True)
        except ExchangeFamily.DoesNotExist:
            return Response(
                {"message": "ExchangeFamily not found."}, status=HTTP_404_NOT_FOUND
            )

        data = request.data.copy()
        serializer = ExchangeFamilySerializer(exchange_family, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        exchange_family = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        updated = ExchangeFamily.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response(
                {"error": "ExchangeFamily not found"}, status=HTTP_404_NOT_FOUND
            )
        return Response(status=HTTP_204_NO_CONTENT)


class DocumentView(APIView):
    def get(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)
        is_student = "student" in user_groups

        if not is_student and not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        documents = Document.objects.order_by("-id")
        documents = documents.filter(is_active=True)

        if is_student:
            try:
                student = Student.objects.get(id_user=request.user, is_active=True)
                documents = documents.filter(id_student=student.id)
            except Student.DoesNotExist:
                return Response(
                    {"message": "Student profile not found for this user."},
                    status=HTTP_404_NOT_FOUND,
                )

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
        user_groups = request.user.groups.values_list("name", flat=True)
        is_student = "student" in user_groups

        if not is_student and not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        if is_student:
            data.update(
                {
                    "id_student": request.user.id_student.id,
                    "id_staff": None,
                    "id_club": None,
                    "id_family": None,
                    "id_district": None,
                }
            )

        serializer = DocumentSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        user_groups = request.user.groups.values_list("name", flat=True)
        is_student = "student" in user_groups

        if not is_student and not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            document = Document.objects.get(pk=pk, is_active=True)
        except Document.DoesNotExist:
            return Response(
                {"message": "Document not found."}, status=HTTP_404_NOT_FOUND
            )

        if is_student and document.id_student != request.user.id_student.id:
            return Response(
                {"message": "You can only edit your own documents."},
                status=HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        if is_student:
            data.update(
                {
                    "id_student": request.user.id_student.id,
                    "id_staff": None,
                    "id_club": None,
                    "id_family": None,
                    "id_district": None,
                }
            )

        serializer = DocumentSerializer(document, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        document = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        updated = Document.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Document not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)
