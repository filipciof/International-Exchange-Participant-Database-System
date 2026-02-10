from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from main.models.club import Club
from main.models.gender import Gender


class Family(models.Model):
    id_club = models.ForeignKey(
        Club, null=True, on_delete=models.SET_NULL, db_column="id_club"
    )
    name = models.CharField(max_length=50)
    city = models.CharField(max_length=60, blank=True, default="")
    address = models.CharField(max_length=60, blank=True, default="")
    notes = models.TextField(max_length=60, blank=True, default="")

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "family"


class FamilyMember(models.Model):
    id_family = models.ForeignKey(
        Family, null=True, on_delete=models.SET_NULL, db_column="id_family"
    )

    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, default="")
    last_name = models.CharField(max_length=50)

    gender = models.IntegerField(choices=Gender, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

    email = models.EmailField(blank=True, default="")
    phone = PhoneNumberField(blank=True, default="")

    is_head_of_family = models.BooleanField(default=False)
    occupation = models.CharField(max_length=30, blank=True, default="")

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "familyMember"
