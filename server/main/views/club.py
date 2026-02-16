from django_filters import rest_framework as filters
from django.db.models import Q
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from main.models import Country, District, Club
from main.serializers import CountrySerializer, DistrictSerializer, ClubSerializer
from main.permissions import ClubPermission, DistrictPermission
from main.selectors import club_queryset_for, district_queryset_for


class ClubFilter(filters.FilterSet):
    search = filters.CharFilter(method="filter_search")

    class Meta:
        model = Club
        fields = ["id_district"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(Q(name__icontains=value) | Q(city__icontains=value))


class CountryView(ListAPIView):
    queryset = Country.objects.order_by("id")
    serializer_class = CountrySerializer
    pagination_class = None


class DistrictFilter(filters.FilterSet):
    search = filters.CharFilter(method="filter_search")
    country = filters.NumberFilter(field_name="id_country")

    class Meta:
        model = District
        fields = ["id_country"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(number__icontains=value)


class DistrictListView(ListCreateAPIView):
    serializer_class = DistrictSerializer
    permission_classes = [DistrictPermission]
    filterset_class = DistrictFilter

    def get_queryset(self):
        return district_queryset_for(self.request.user).order_by("-id")


class DistrictDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = DistrictSerializer
    permission_classes = [DistrictPermission]
    queryset = District.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class ClubListView(ListCreateAPIView):
    serializer_class = ClubSerializer
    permission_classes = [ClubPermission]
    filterset_class = ClubFilter

    def get_queryset(self):
        return club_queryset_for(self.request.user).order_by("-id")


class ClubDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ClubSerializer
    permission_classes = [ClubPermission]
    queryset = Club.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
