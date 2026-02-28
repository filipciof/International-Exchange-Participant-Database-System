from django_filters import rest_framework as filters
from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from main.models import Family, FamilyMember
from main.serializers import FamilySerializer, FamilyMemberSerializer
from main.permissions import FamilyPermission, FamilyMemberPermission
from main.selectors import family_queryset_for, family_member_queryset_for


class FamilyFilter(filters.FilterSet):
    search = filters.CharFilter(method="filter_search")
    id_district = filters.NumberFilter(field_name="id_club__id_district")
    id_country = filters.NumberFilter(field_name="id_club__id_district__id_country")

    class Meta:
        model = Family
        fields = ["id_club"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value)
            | Q(city__icontains=value)
            | Q(address__icontains=value)
        )


class FamilyListView(ListCreateAPIView):
    serializer_class = FamilySerializer
    permission_classes = [FamilyPermission]
    filterset_class = FamilyFilter

    def get_queryset(self):
        return family_queryset_for(self.request.user).order_by("-id")


class FamilyDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = FamilySerializer
    permission_classes = [FamilyPermission]
    queryset = Family.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class FamilyMemberFilter(filters.FilterSet):
    class Meta:
        model = FamilyMember
        fields = ["id_family"]


class FamilyMemberListView(ListCreateAPIView):
    serializer_class = FamilyMemberSerializer
    permission_classes = [FamilyMemberPermission]
    filterset_class = FamilyMemberFilter

    def get_queryset(self):
        return family_member_queryset_for(self.request.user).order_by("-id")


class FamilyMemberDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = FamilyMemberSerializer
    permission_classes = [FamilyMemberPermission]
    queryset = FamilyMember.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
