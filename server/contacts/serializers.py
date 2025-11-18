from rest_framework import serializers
from .models import Contact, ContactDistrict
from main.models import Gender


class ContactSerializer(serializers.ModelSerializer):
    country = serializers.SerializerMethodField()
    districts = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()

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
            "districts",
            "is_longterm",
            "is_family_to_family",
            "is_camp",
            "photo",
            "notes",
        ]

    def get_country(self, obj):
        return obj.id_country.name if obj.id_country else None
    
    def get_districts(self, obj):
        districts = ContactDistrict.objects.filter(id_contact=obj)
        return [district.id_district.number for district in districts]
    
    def get_gender(self, obj):
        genderMap = {
            Gender.MALE: "male",
            Gender.FEMALE: "female",
            Gender.NONBINARY: "nonbinary",            
        }
        return genderMap.get(obj.gender, "unknown")
