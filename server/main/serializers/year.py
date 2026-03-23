from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from main.models import Year


class YearSerializer(serializers.ModelSerializer):
    value = serializers.CharField(
        max_length=9,
        validators=[
            RegexValidator(regex=r"^\d{4}/\d{2}$"),
            UniqueValidator(
                queryset=Year.objects.all(),
                message=_("Year with this value already exists."),
            ),
        ],
    )

    class Meta:
        model = Year
        fields = ["id", "value", "is_current"]
