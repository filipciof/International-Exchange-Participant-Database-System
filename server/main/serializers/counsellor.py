from django.utils.translation import gettext as _
from rest_framework import serializers
from main.models import Club, Counsellor, GENDER_MAP
from main.serializers.club import ClubSerializer
from main.permissions.base import Roles


class CreateCounsellorSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    id_club = serializers.IntegerField()

    def validate_id_club(self, value):
        if not Club.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError(_("Club does not exist."))
        return value

    def validate(self, attrs):
        if self.context.get("active_role") == Roles.CLUB_OFFICER:
            user = self.context.get("user")
            staff = getattr(user, "id_staff", None)

            if not staff or attrs["id_club"] != staff.id_club_id:
                raise serializers.ValidationError(
                    {
                        "id_club": _(
                            "Club officers can only create counsellors for their own club."
                        )
                    }
                )

        return attrs


class CounsellorSerializer(serializers.ModelSerializer):
    club = ClubSerializer(source="id_club", read_only=True)

    class Meta:
        model = Counsellor
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
        return representation
