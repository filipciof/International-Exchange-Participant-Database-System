from django.utils.translation import gettext as _
from rest_framework import serializers
from main.models import Student, GENDER_MAP, LANG_PROF_MAP, Club
from main.permissions import (
    is_club_from_home_country,
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
)

from django.contrib.auth import get_user_model

User = get_user_model()


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
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
        representation["user_email"] = (
            instance.id_user.email if instance.id_user else ""
        )

        return representation


class CreateStudentSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    id_club = serializers.IntegerField()
    is_inbound = serializers.BooleanField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("Email is already in use."))
        return value

    def validate_id_club(self, value):
        if not Club.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError(_("Club does not exist."))
        return value

    def validate(self, attrs):
        user = self.context.get("user")

        club = Club.objects.select_related("id_district__id_country").get(
            id=attrs["id_club"], is_active=True
        )

        if attrs.get("is_inbound") and is_club_from_home_country(club):
            raise serializers.ValidationError(
                {"id_club": _("Inbound students must have a foreign sending club.")}
            )

        if not attrs.get("is_inbound") and not is_club_from_home_country(club):
            raise serializers.ValidationError(
                {
                    "id_club": _(
                        "Outbound students must have a home country sending club."
                    )
                }
            )

        if not user:
            return attrs

        is_inbound = attrs.get("is_inbound")
        can_create_inbound = (
            is_admin(user) or is_correspondent(user) or is_kwm_officer(user)
        )
        can_create_outbound = is_admin(user) or is_club_officer(user)

        if is_inbound and not can_create_inbound:
            raise serializers.ValidationError(
                {
                    "is_inbound": _(
                        "You do not have permission to create inbound students."
                    )
                }
            )

        if not is_inbound and not can_create_outbound:
            raise serializers.ValidationError(
                {
                    "is_inbound": _(
                        "You do not have permission to create outbound students."
                    )
                }
            )

        if is_club_officer(user) and not is_inbound:
            staff = getattr(user, "id_staff", None)
            if staff and staff.id_club_id and attrs["id_club"] != staff.id_club_id:
                raise serializers.ValidationError(
                    {
                        "id_club": _(
                            "Club officers can only create students for their own club."
                        )
                    }
                )

        return attrs


class StudentUserAccountUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        user = self.context.get("user")
        if user and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(_("Email is already in use."))
        return value
