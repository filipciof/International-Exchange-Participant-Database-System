from main.models import Document
from main.serializers import DocumentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
)
from rest_framework.pagination import PageNumberPagination
from main.permissions import DocumentPermission
from main.selectors import document_queryset_for
from django.shortcuts import get_object_or_404


class DocumentView(APIView):
    permission_classes = [DocumentPermission]

    def get(self, request):
        documents = document_queryset_for(request.user).order_by("-id")

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
        data = request.data.copy()

        serializer = DocumentSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def patch(self, request, pk=None):
        document = get_object_or_404(Document, pk=pk)
        self.check_object_permissions(request, document)

        data = request.data.copy()
        serializer = DocumentSerializer(document, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        document = serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk=None):
        document = get_object_or_404(Document, pk=pk)
        self.check_object_permissions(request, document)
        document.is_active = False
        document.save(update_fields=["is_active"])
        return Response(status=HTTP_204_NO_CONTENT)
