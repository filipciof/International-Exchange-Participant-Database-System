from django_filters import rest_framework as filters
from django.db.models import Q
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from main.models import ExchangeType, Exchange, ExchangeFamily
from main.serializers import (
    ExchangeTypeSerializer,
    ExchangeSerializer,
    ExchangeFamilySerializer,
)
from main.permissions import ExchangeFamilyPermission, ExchangePermission
from main.selectors import exchange_family_queryset_for, exchange_queryset_for


class ExchangeTypeView(ListAPIView):
    serializer_class = ExchangeTypeSerializer
    queryset = ExchangeType.objects.order_by("id")


class ExchangeFilter(filters.FilterSet):
    class Meta:
        model = Exchange
        fields = ["id_student"]


class ExchangeListView(ListCreateAPIView):
    serializer_class = ExchangeSerializer
    permission_classes = [ExchangePermission]
    filterset_class = ExchangeFilter

    def get_queryset(self):
        return exchange_queryset_for(self.request.user).order_by("-id")


class ExchangeDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ExchangeSerializer
    permission_classes = [ExchangePermission]
    queryset = Exchange.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class ExchangeFamilyFilter(filters.FilterSet):
    class Meta:
        model = ExchangeFamily
        fields = ["id_exchange", "id_family"]


class ExchangeFamilyListView(ListCreateAPIView):
    serializer_class = ExchangeFamilySerializer
    permission_classes = [ExchangeFamilyPermission]
    filterset_class = ExchangeFamilyFilter

    def get_queryset(self):
        return exchange_family_queryset_for(self.request.user).order_by("-id")


class ExchangeFamilyDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ExchangeFamilySerializer
    permission_classes = [ExchangeFamilyPermission]
    queryset = ExchangeFamily.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
