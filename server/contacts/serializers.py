from rest_framework import serializers
from .models import Contact, ContactDistrict
from main.models import Gender


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = "__all__"
        extra_kwargs = {
            'is_active': {'required': False, 'default': True}
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation["country"] = (
            instance.id_country.name if instance.id_country else None
        )

        contactdistricts = ContactDistrict.objects.filter(id_contact=instance)
        representation["districts"] = [
            contactdistrict.id_district.number for contactdistrict in contactdistricts
        ]
        representation["id_districts"] = [
            contactdistrict.id_district.id for contactdistrict in contactdistricts
        ]

        gender_map = {
            Gender.MALE: "male",
            Gender.FEMALE: "female",
            Gender.NONBINARY: "nonbinary",
        }
        representation["gender_name"] = gender_map.get(instance.gender, "unknown")

        return representation
