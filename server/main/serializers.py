from rest_framework import serializers
from .models import (
    Club,
    Document,
    ExchangeFamily,
    Family,
    FamilyMember,
    Student,
    Country,
    District,
    GENDER_MAP,
    LANG_PROF_MAP,
    ExchangeType,
    Exchange,
    Staff,
)


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = "__all__"


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = "__all__"


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["district"] = (
            instance.id_district.number if instance.id_district else None
        )
        representation["country"] = (
            instance.id_district.id_country.name
            if instance.id_district and instance.id_district.id_country
            else None
        )
        representation["id_country"] = (
            instance.id_district.id_country.id
            if instance.id_district and instance.id_district.id_country
            else None
        )
        return representation


class FamilySerializer(serializers.ModelSerializer):
    club = ClubSerializer(source="id_club", read_only=True)

    class Meta:
        model = Family
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}


class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["family_name"] = (
            instance.id_family.name if instance.id_family else None
        )
        representation["gender_name"] = GENDER_MAP.get(instance.gender, "unknown")
        return representation


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}

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
        representation["gender_name"] = GENDER_MAP.get(instance.gender, "unknown")
        representation["second_language_proficiency_name"] = LANG_PROF_MAP.get(
            instance.second_language_proficiency, ""
        )
        representation["third_language_proficiency_name"] = LANG_PROF_MAP.get(
            instance.third_language_proficiency, ""
        )

        return representation


class ExchangeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeType
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation["name"] = (
            instance.subtype
            if instance.name and instance.subtype
            else (
                "longterm"
                if instance.name and instance.name == "lt"
                else ("shortterm" if instance.name and instance.name == "st" else "")
            )
        )

        return representation


class ExchangeSerializer(serializers.ModelSerializer):
    receiving_club = ClubSerializer(source="id_receiving_club", read_only=True)
    sending_club = ClubSerializer(source="id_sending_club", read_only=True)

    class Meta:
        model = Exchange
        fields = "__all__"
        extra_kwargs = {
            "is_active": {"required": False, "default": True},
            "is_inbound": {"required": False, "default": True},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation["counsellor"] = (
            " ".join(
                filter(
                    None,
                    [
                        instance.id_counsellor.first_name,
                        instance.id_counsellor.middle_name,
                        instance.id_counsellor.last_name,
                    ],
                )
            )
            if instance.id_counsellor
            else ""
        )

        representation["kwm_officer"] = (
            " ".join(
                filter(
                    None,
                    [
                        instance.id_kwm_officer.first_name,
                        instance.id_kwm_officer.middle_name,
                        instance.id_kwm_officer.last_name,
                    ],
                )
            )
            if instance.id_kwm_officer
            else ""
        )

        representation["type"] = (
            instance.id_type.subtype
            if instance.id_type and instance.id_type.subtype
            else (
                "longterm"
                if instance.id_type and instance.id_type.name == "lt"
                else (
                    "shortterm"
                    if instance.id_type and instance.id_type.name == "st"
                    else ""
                )
            )
        )

        return representation


class ExchangeFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeFamily
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["family_name"] = (
            instance.id_family.name if instance.id_family else ""
        )
        representation["student_name"] = (
            " ".join(
                filter(
                    None,
                    [
                        instance.id_exchange.id_student.first_name,
                        instance.id_exchange.id_student.middle_name,
                        instance.id_exchange.id_student.last_name,
                    ],
                )
            )
            if instance.id_exchange and instance.id_exchange.id_student
            else ""
        )
        return representation


class StaffSerializer(serializers.ModelSerializer):
    club = ClubSerializer(source="id_club", read_only=True)

    class Meta:
        model = Staff
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["gender_name"] = GENDER_MAP.get(instance.gender, "unknown")
        return representation


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation
