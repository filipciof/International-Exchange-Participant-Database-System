from main.models import Family, FamilyMember
from main.serializers import FamilySerializer, FamilyMemberSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
)
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from main.permissions import FamilyPermission, FamilyMemberPermission
from main.selectors import family_member_queryset_for, family_queryset_for
from django.shortcuts import get_object_or_404


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
