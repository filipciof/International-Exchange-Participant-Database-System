from rest_framework import serializers
from main.models import Contact, ContactDistrict, GENDER_MAP


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation["country"] = (
            instance.id_country.name if instance.id_country else None
        )

        contact_districts = ContactDistrict.objects.filter(id_contact=instance)
        representation["districts"] = [
            contact_district.id_district.number for contact_district in contact_districts
        ]
        representation["id_districts"] = [
            contact_district.id_district.id for contact_district in contact_districts
        ]

        representation["gender_name"] = GENDER_MAP.get(instance.gender, "unknown")

        return representation
