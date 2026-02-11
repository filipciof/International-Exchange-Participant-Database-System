from rest_framework import serializers
from main.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        extra_kwargs = {
            "is_active": {"required": False, "default": True},
            "file": {"write_only": True},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["has_file"] = bool(instance.file)
        return representation
