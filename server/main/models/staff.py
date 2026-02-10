from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth import get_user_model
from main.models.club import Club
from main.models.gender import Gender

User = get_user_model()


class Staff(models.Model):
    id_user = models.OneToOneField(
        User,
        null=True,
        on_delete=models.SET_NULL,
        db_column="id_user",
        related_name="id_staff",
    )

    id_club = models.ForeignKey(
        Club, null=True, on_delete=models.SET_NULL, db_column="id_club"
    )
    position = models.CharField(max_length=60, blank=True, default="")

    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, default="")
    last_name = models.CharField(max_length=50)

    gender = models.IntegerField(choices=Gender, null=True)
    email = models.EmailField(blank=True, default="")
    phone = PhoneNumberField(blank=True, default="")

    photo = models.ImageField(upload_to="staff_photos/", blank=True, default="")
    notes = models.TextField(blank=True, default="")

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "staff"
