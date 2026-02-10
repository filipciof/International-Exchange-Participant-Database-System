from rest_framework import serializers
from main.models import Family, FamilyMember, GENDER_MAP
from main.serializers.club import ClubSerializer


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
