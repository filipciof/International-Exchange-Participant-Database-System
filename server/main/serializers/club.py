from rest_framework import serializers
from main.models import Country, District, Club


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
