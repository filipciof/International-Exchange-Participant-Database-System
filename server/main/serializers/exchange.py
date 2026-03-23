from rest_framework import serializers
from main.models import ExchangeType, Exchange, ExchangeFamily
from main.serializers.club import ClubSerializer


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

        representation["year"] = instance.id_year.value if instance.id_year else ""

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
