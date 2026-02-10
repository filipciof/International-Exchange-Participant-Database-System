from django.db import models
from django.core.validators import RegexValidator
from main.models.student import Student
from main.models.club import Club
from main.models.staff import Staff
from main.models.family import Family


class ExchangeType(models.Model):
    name = models.CharField(max_length=20)
    subtype = models.CharField(max_length=20, blank=True, default="")

    class Meta:
        db_table = "exchangeType"


class Exchange(models.Model):
    id_student = models.ForeignKey(
        Student, null=True, on_delete=models.SET_NULL, db_column="id_student"
    )
    id_receiving_club = models.ForeignKey(
        Club,
        null=True,
        on_delete=models.SET_NULL,
        related_name="received_exchange",
        db_column="id_receiving_club",
    )
    id_sending_club = models.ForeignKey(
        Club,
        null=True,
        on_delete=models.SET_NULL,
        related_name="sent_exchange",
        db_column="id_sending_club",
    )
    id_counsellor = models.ForeignKey(
        Staff,
        null=True,
        on_delete=models.SET_NULL,
        related_name="exchange_counsellor",
        db_column="id_counsellor",
    )
    id_kwm_officer = models.ForeignKey(
        Staff,
        null=True,
        on_delete=models.SET_NULL,
        related_name="exchange_kwm_officer",
        db_column="id_kwm_officer",
    )
    id_type = models.ForeignKey(
        ExchangeType, null=True, on_delete=models.SET_NULL, db_column="id_type"
    )
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    year = models.CharField(
        max_length=9,
        validators=[
            RegexValidator(
                regex=r"^\d{4}/\d{2}$",
            )
        ],
        blank=True,
        default="",
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "exchange"


class ExchangeFamily(models.Model):
    id_exchange = models.ForeignKey(
        Exchange, null=True, on_delete=models.SET_NULL, db_column="id_exchange"
    )
    id_family = models.ForeignKey(
        Family, null=True, on_delete=models.SET_NULL, db_column="id_family"
    )
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "exchangeFamily"
