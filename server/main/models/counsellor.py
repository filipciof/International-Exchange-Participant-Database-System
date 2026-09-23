from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth import get_user_model
from main.models.club import Club
from main.models.gender import Gender

User = get_user_model()


class Counsellor(models.Model):
    id_club = models.ForeignKey(
        Club, null=True, on_delete=models.SET_NULL, db_column="id_club"
    )
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, default="")
    last_name = models.CharField(max_length=50)
    gender = models.IntegerField(choices=Gender, null=True)
    phone = PhoneNumberField(blank=True, default="")
    photo = models.ImageField(upload_to="counsellor_photos/", blank=True, default="")
    notes = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "counsellor"
