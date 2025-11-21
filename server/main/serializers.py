from rest_framework import serializers
from .models import Club, Family, Student, Country, District

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
    country_of_birth = serializers.SerializerMethodField()
    country_of_departure = serializers.SerializerMethodField()
    country_of_passport = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "first_name",
            "middle_name",
            "last_name",
            "nick_name",
            "gender",
            "date_of_birth",
            "country_of_birth",
            "city_of_birth",
            "city_of_residence",
            "address",
            "height",
            "shirt_size",
            "dietary_restrictions",
            "first_language",
            "second_language",
            "second_language_proficiency",
            "third_language",
            "third_language_proficiency",
            "country_of_departure",
            "country_of_passport",
            "passport_number",
            "passport_expiration_date",
            "first_parent_full_name",
            "first_parent_email",
            "second_parent_full_name",
            "second_parent_email",
            "polish_phone_number",
            "insurance_company",
            "insurance_type",
            "insurance_serial_number",
            "insurance_amount",
            "photo",
            "notes",
        ]

    def get_country_of_birth(self, obj):
        return obj.id_country_of_birth.name if obj.id_country_of_birth else None

    def get_country_of_departure(self, obj):
        return obj.id_country_of_departure.name if obj.id_country_of_departure else None

    def get_country_of_passport(self, obj):
        return obj.id_country_of_passport.name if obj.id_country_of_passport else None
