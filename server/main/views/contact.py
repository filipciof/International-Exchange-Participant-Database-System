from django_filters import rest_framework as filters
from django.db.models import Q
from rest_framework.generics import (
    GenericAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from django.http import FileResponse
from main.models import Contact, ContactDistrict
from main.serializers import ContactSerializer
from main.permissions import ContactPermission
from main.selectors import contact_queryset_for
import os
from config.settings import MEDIA_ROOT

CONTACT_GROUPS = ["lt", "f2f", "camp", "none"]


class ContactFilter(filters.FilterSet):
    search = filters.CharFilter(method="filter_search")
    group = filters.MultipleChoiceFilter(
        choices=[(g, g) for g in CONTACT_GROUPS],
        method="filter_group",
    )

    class Meta:
        model = Contact
        fields = ["id_country"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value)
            | Q(middle_name__icontains=value)
            | Q(last_name__icontains=value)
            | Q(email__icontains=value)
            | Q(phone__icontains=value)
            | Q(notes__icontains=value)
        )

    def filter_group(self, queryset, name, value):
        group_query = Q()
        for group in value:
            if group == "lt":
                group_query |= Q(is_longterm=True)
            elif group == "f2f":
                group_query |= Q(is_family_to_family=True)
            elif group == "camp":
                group_query |= Q(is_camp=True)
            elif group == "none":
                group_query |= Q(
                    is_longterm=False, is_family_to_family=False, is_camp=False
                )
        return queryset.filter(group_query)


class ContactPhotoView(GenericAPIView):
    permission_classes = [ContactPermission]
    queryset = Contact.objects.filter(is_active=True)

    def get(self, request, pk):
        contact = self.get_object()
        if not contact.photo:
            return FileResponse(status=404)
        return FileResponse(contact.photo.open())


class ContactListView(ListCreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [ContactPermission]
    filterset_class = ContactFilter

    def get_queryset(self):
        return contact_queryset_for(self.request.user).order_by("-id")

    def perform_create(self, serializer):
        contact = serializer.save()
        if "multipart" in self.request.content_type:
            id_districts = self.request.data.getlist("id_districts", [])
        else:
            id_districts = self.request.data.get("id_districts", [])
        for id_district in id_districts:
            ContactDistrict.objects.create(
                id_contact=contact, id_district_id=id_district
            )


class ContactDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ContactSerializer
    permission_classes = [ContactPermission]
    queryset = Contact.objects.filter(is_active=True)

    def perform_update(self, serializer):
        photo = self.request.FILES.get("photo")
        if photo and serializer.instance.photo:
            old_path = os.path.join(MEDIA_ROOT, str(serializer.instance.photo))
            if os.path.exists(old_path):
                os.remove(old_path)

        contact = serializer.save()

        if "multipart" in self.request.content_type:
            id_districts = self.request.data.getlist("id_districts")
        else:
            id_districts = self.request.data.get("id_districts")
        if id_districts:
            ContactDistrict.objects.filter(id_contact=contact).delete()
            for id_district in id_districts:
                ContactDistrict.objects.create(
                    id_contact=contact, id_district_id=id_district
                )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
