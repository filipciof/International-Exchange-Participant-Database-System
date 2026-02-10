from django_filters import rest_framework as filters
from django.db.models import Q
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from main.models import Country, District, Club
from main.serializers import CountrySerializer, DistrictSerializer, ClubSerializer
from main.permissions import ClubPermission
from main.selectors import club_queryset_for


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


class DistrictView(ListAPIView):
    serializer_class = DistrictSerializer
    pagination_class = None

    def get_queryset(self):
        qs = District.objects.order_by("id")
        country = self.request.query_params.get("country")
        if country:
            qs = qs.filter(id_country=country)
        return qs


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
