from django.utils.translation import gettext as _
from rest_framework import serializers
from main.models import Club, Staff, GENDER_MAP
from main.serializers.club import ClubSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CreateStaffSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    id_club = serializers.IntegerField()
    groups = serializers.MultipleChoiceField(
        choices=["admin", "correspondent", "club_officer", "kwm_officer"]
    )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("Email is already in use."))
        return value

    def validate_id_club(self, value):
        if not Club.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError(_("Club does not exist."))
        return value


class StaffSerializer(serializers.ModelSerializer):
    club = ClubSerializer(source="id_club", read_only=True)

    class Meta:
        model = Staff
        fields = "__all__"
        extra_kwargs = {
            "is_active": {"required": False, "default": True},
            "photo": {"write_only": True},
        }

    def validate(self, attrs):
        if self.instance and self.instance.id_user is not None:
            attrs.pop("id_user", None)

        return attrs

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["has_photo"] = bool(instance.photo)
        representation["gender_name"] = GENDER_MAP.get(instance.gender, "unknown")
        representation["user_email"] = (
            instance.id_user.email if instance.id_user else ""
        )
        representation["user_groups"] = (
            list(instance.id_user.groups.values_list("name", flat=True))
            if instance.id_user
            else []
        )
        return representation


class StaffUserAccountUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    groups = serializers.MultipleChoiceField(
        choices=["admin", "correspondent", "club_officer", "kwm_officer"],
        required=False,
    )

    def validate_email(self, value):
        user = self.context.get("user")
        if user and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(_("Email is already in use."))
        return value

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(_("No data provided."))
        return attrs
