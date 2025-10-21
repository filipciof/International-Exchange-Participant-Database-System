from django.db import models
from phonenumber_field.modelfields import PhoneNumberField


class Contact(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    phone = PhoneNumberField()
    country = models.CharField(max_length=30)
    districts = models.JSONField()
    photo = models.ImageField(upload_to="contact_photos/")

