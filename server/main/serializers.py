from rest_framework import serializers
from .models import (
    Club,
    Family,
    Student,
    Country,
    District,
    Gender,
    LanguageProficiency,
    Exchange,
)


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["id", "name", "code"]


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = "__all__"


class ClubSerializer(serializers.ModelSerializer):
    district = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = ["id", "country", "district", "name", "city"]

    def get_district(self, obj):
        return obj.id_district.number if obj.id_district else None

    def get_country(self, obj):
        return (
            obj.id_district.id_country.name
            if obj.id_district and obj.id_district.id_country
            else None
        )


class FamilySerializer(serializers.ModelSerializer):
    club = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ["id", "name", "club", "city", "address", "notes"]

    def get_club(self, obj):
        return obj.id_club.name if obj.id_club else None


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation["country_of_birth"] = (
            instance.id_country_of_birth.name if instance.id_country_of_birth else ""
        )
        representation["country_of_departure"] = (
            instance.id_country_of_departure.name
            if instance.id_country_of_departure
            else ""
        )
        representation["country_of_passport"] = (
            instance.id_country_of_passport.name
            if instance.id_country_of_passport
            else ""
        )

        gender_map = {
            Gender.MALE: "male",
            Gender.FEMALE: "female",
            Gender.NONBINARY: "nonbinary",
        }
        representation["gender_name"] = gender_map.get(instance.gender, "unknown")

        lang_prof_map = {
            LanguageProficiency.BEGINNER: "beginner",
            LanguageProficiency.CONVERSATIONAL: "conversational",
            LanguageProficiency.ADVANCED: "advanced",
            LanguageProficiency.FLUENT: "fluent",
        }
        representation["second_language_proficiency_name"] = lang_prof_map.get(
            instance.second_language_proficiency, None
        )
        representation["third_language_proficiency_name"] = lang_prof_map.get(
            instance.third_language_proficiency, None
        )

        return representation


class ExchangeSerializer(serializers.ModelSerializer):
    receiving_club = ClubSerializer(source='id_receiving_club', read_only=True)
    sending_club = ClubSerializer(source='id_sending_club', read_only=True)
    
    class Meta:
        model = Exchange
        fields = "__all__"
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        representation["counsellor"] = (
            " ".join(filter(None, [
                instance.id_counsellor.first_name,
                instance.id_counsellor.middle_name,
                instance.id_counsellor.last_name
            ]))
            if instance.id_counsellor
            else ""
        )
        
        representation["kwm_officer"] = (
            " ".join(filter(None, [
                instance.id_kwm_officer.first_name,
                instance.id_kwm_officer.middle_name,
                instance.id_kwm_officer.last_name
            ]))
            if instance.id_kwm_officer
            else ""
        )
        
        representation["type"] = (
            instance.id_type.subtype
            if instance.id_type and instance.id_type.subtype
            else (
                "longterm"
                if instance.id_type and instance.id_type.name == "lt"
                else "shortterm" if instance.id_type and instance.id_type.name == "st" else ""
            )
        )
        
        return representation