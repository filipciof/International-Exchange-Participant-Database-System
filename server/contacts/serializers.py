from rest_framework import serializers
from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    country = serializers.SerializerMethodField

    class Meta:
        model = Contact
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "country",
            "districts",
            "photo",
        ]

    def get_country(self, obj):
        return obj.country.name if obj.country else None
