from main.models import ExchangeType, Exchange, ExchangeFamily
from main.serializers import (
    ExchangeTypeSerializer,
    ExchangeSerializer,
    ExchangeFamilySerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
)
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from main.permissions import ExchangeFamilyPermission, ExchangePermission
from main.selectors import exchange_family_queryset_for, exchange_queryset_for
from django.shortcuts import get_object_or_404


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
