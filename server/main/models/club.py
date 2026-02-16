from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class Country(models.Model):
    name = models.CharField(max_length=60)
    code = models.CharField(max_length=2, unique=True)
    is_home_country = models.BooleanField(default=False)

    class Meta:
        db_table = "country"


class District(models.Model):
    id_country = models.ForeignKey(
        Country, null=True, on_delete=models.SET_NULL, db_column="id_country"
    )
    number = models.CharField(
        max_length=10, unique=True, validators=[RegexValidator(regex=r"^\d+$")]
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "district"


class Club(models.Model):
    id_district = models.ForeignKey(
        District, null=True, on_delete=models.SET_NULL, db_column="id_district"
    )
    name = models.CharField(max_length=60)
    city = models.CharField(max_length=30, blank=True, default="")
    number = models.CharField(
        max_length=10, unique=True, validators=[RegexValidator(regex=r"^\d+$")]
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "club"
