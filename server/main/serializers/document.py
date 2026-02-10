from rest_framework import serializers
from main.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}
