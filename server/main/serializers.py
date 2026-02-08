from django.utils.translation import gettext as _
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
from django.contrib.auth import get_user_model
from config.permissions.base import (
    is_admin,
    is_correspondent,
    is_kwm_officer,
    is_club_officer,
    is_club_from_home_country,
)

User = get_user_model()


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

    def validate(self, attrs):
        if self.instance and self.instance.id_user is not None:
            attrs.pop("id_user", None)

        return attrs

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
                {"id_club": _("Outbound students must have a home country sending club.")}
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
                {"is_inbound": _("You do not have permission to create inbound students.")}
            )

        if not is_inbound and not can_create_outbound:
            raise serializers.ValidationError(
                {
                    "is_inbound": _("You do not have permission to create outbound students.")
                }
            )

        if is_club_officer(user) and not is_inbound:
            staff = getattr(user, "id_staff", None)
            if staff and staff.id_club_id and attrs["id_club"] != staff.id_club_id:
                raise serializers.ValidationError(
                    {
                        "id_club": _("Club officers can only create students for their own club.")
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
        extra_kwargs = {"is_active": {"required": False, "default": True}}

    def validate(self, attrs):
        if self.instance and self.instance.id_user is not None:
            attrs.pop("id_user", None)

        return attrs

    def to_representation(self, instance):
        representation = super().to_representation(instance)
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


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        extra_kwargs = {"is_active": {"required": False, "default": True}}

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation
