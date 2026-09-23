from django_filters import rest_framework as filters
from django.db.models import Q
from django.db import transaction
from django.http import FileResponse
from rest_framework.generics import (
    GenericAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from main.models import Club, Counsellor
from main.serializers import (
    CreateCounsellorSerializer,
    CounsellorSerializer,
)
from main.permissions import CounsellorPermission
from main.selectors.counsellor import counsellor_queryset_for


class CounsellorFilter(filters.FilterSet):
    search = filters.CharFilter(method="filter_search")
    id_club = filters.NumberFilter(field_name="id_club")
    id_district = filters.NumberFilter(field_name="id_club__id_district")
    id_country = filters.NumberFilter(field_name="id_club__id_district__id_country")

    class Meta:
        model = Counsellor
        fields = []

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value)
            | Q(middle_name__icontains=value)
            | Q(last_name__icontains=value)
            | Q(phone__icontains=value)
            | Q(id_user__email__icontains=value)
        )


class CounsellorListView(ListCreateAPIView):
    serializer_class = CounsellorSerializer
    permission_classes = [CounsellorPermission]
    filterset_class = CounsellorFilter

    def get_queryset(self):
        return counsellor_queryset_for(self.request.user).order_by("-id")

    def create(self, request, *args, **kwargs):
        serializer = CreateCounsellorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        club = Club.objects.get(id=data["id_club"], is_active=True)

        with transaction.atomic():
            instance = Counsellor.objects.create(
                id_club=club,
                first_name=data["first_name"],
                last_name=data["last_name"],
                is_active=True,
            )

        response_serializer = CounsellorSerializer(instance)
        return Response(response_serializer.data, status=HTTP_201_CREATED)


class CounsellorDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CounsellorSerializer
    permission_classes = [CounsellorPermission]
    queryset = Counsellor.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        if instance.id_user:
            instance.id_user.is_active = False
            instance.id_user.save(update_fields=["is_active"])
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class CounsellorPhotoView(GenericAPIView):
    permission_classes = [CounsellorPermission]
    queryset = Counsellor.objects.filter(is_active=True)

    def get(self, request, pk):
        instance = self.get_object()
        if not instance.photo:
            return FileResponse(status=404)
        return FileResponse(instance.photo.open())
