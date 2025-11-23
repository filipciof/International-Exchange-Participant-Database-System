from rest_framework import serializers
from .models import Contact, ContactDistrict
from main.models import Gender


class ContactSerializer(serializers.ModelSerializer):
    id_districts = serializers.SerializerMethodField()
    districts = serializers.SerializerMethodField()
    country = serializers.CharField(source="id_country.name", read_only=True)

    class Meta:
        model = Contact
        fields = [
            "id",
            "first_name",
            "middle_name",
            "last_name",
            "gender",
            "email",
            "phone",
            "country",
            "id_country",
            "districts",
            "id_districts",
            "is_longterm",
            "is_family_to_family",
            "is_camp",
            "photo",
            "notes",
        ]

    def get_districts(self, obj):
        districts = ContactDistrict.objects.filter(id_contact=obj)
        return [district.id_district.number for district in districts]
    
    def get_id_districts(self, obj):
        districts = ContactDistrict.objects.filter(id_contact=obj)
        return [district.id_district.id for district in districts]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        genderMap = {
            Gender.MALE: "male",
            Gender.FEMALE: "female",
            Gender.NONBINARY: "nonbinary",
        }
        representation["gender_name"] = genderMap.get(instance.gender, "unknown")
        return representation
