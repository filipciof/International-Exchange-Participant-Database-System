from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from main.models import Country, District
from main.models import Gender


class Contact(models.Model):
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, default="")
    last_name = models.CharField(max_length=50)
    gender = models.IntegerField(choices=Gender, null=True)

    email = models.EmailField(blank=True, default="")
    phone = PhoneNumberField(blank=True, default="")

    id_country = models.ForeignKey(
        Country, null=True, on_delete=models.SET_NULL, db_column="id_country"
    )

    is_longterm = models.BooleanField(default=False)
    is_family_to_family = models.BooleanField(default=False)
    is_camp = models.BooleanField(default=False)

    photo = models.ImageField(upload_to="contact_photos/", blank=True, default="")
    notes = models.TextField(blank=True, default="")

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "contact"


class ContactDistrict(models.Model):
    id_contact = models.ForeignKey(
        Contact, null=True, on_delete=models.SET_NULL, db_column="id_contact"
    )
    id_district = models.ForeignKey(
        District, null=True, on_delete=models.SET_NULL, db_column="id_district"
    )

    class Meta:
        db_table = "contactDistrict"
