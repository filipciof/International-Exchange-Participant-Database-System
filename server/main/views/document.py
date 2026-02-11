from django_filters import rest_framework as filters
from rest_framework.generics import (
    GenericAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from django.http import FileResponse
from main.models import Document
from main.serializers import DocumentSerializer
from main.permissions import DocumentPermission
from main.selectors import document_queryset_for


class DocumentFilter(filters.FilterSet):
    class Meta:
        model = Document
        fields = ["id_student", "id_staff", "id_club", "id_family", "id_district"]


class DocumentListView(ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [DocumentPermission]
    filterset_class = DocumentFilter

    def get_queryset(self):
        return document_queryset_for(self.request.user).order_by("-id")


class DocumentFileView(GenericAPIView):
    permission_classes = [DocumentPermission]
    queryset = Document.objects.filter(is_active=True)

    def get(self, request, pk):
        document = self.get_object()
        if not document.file:
            return FileResponse(status=404)
        return FileResponse(document.file.open())


class DocumentDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [DocumentPermission]
    queryset = Document.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
