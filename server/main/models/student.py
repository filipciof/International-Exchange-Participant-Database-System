from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from main.models.club import Country
from main.models.gender import Gender
from main.models.language_proficiency import LanguageProficiency
from django.contrib.auth import get_user_model

User = get_user_model()


class Student(models.Model):
    id_user = models.OneToOneField(
        User,
        null=True,
        on_delete=models.SET_NULL,
        db_column="id_user",
        related_name="id_student",
    )

    # Names
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, default="")
    last_name = models.CharField(max_length=50)
    nick_name = models.CharField(max_length=30, blank=True, default="")

    # Birth
    gender = models.IntegerField(choices=Gender, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    id_country_of_birth = models.ForeignKey(
        Country,
        null=True,
        on_delete=models.SET_NULL,
        related_name="student_born",
        db_column="id_country_of_birth",
    )
    city_of_birth = models.CharField(max_length=60, blank=True, default="")
    city_of_residence = models.CharField(max_length=60, blank=True, default="")
    address = models.CharField(max_length=60, blank=True, default="")

    # Preferences
    height = models.DecimalField(max_digits=3, decimal_places=2, null=True)
    shirt_size = models.CharField(max_length=10, blank=True, default="")
    dietary_restrictions = models.CharField(max_length=20, blank=True, default="")

    # Languages
    first_language = models.CharField(max_length=20, blank=True, default="")
    second_language = models.CharField(max_length=20, blank=True, default="")
    second_language_proficiency = models.IntegerField(
        choices=LanguageProficiency, null=True
    )
    third_language = models.CharField(max_length=20, blank=True, default="")
    third_language_proficiency = models.IntegerField(
        choices=LanguageProficiency, null=True
    )

    # Passport
    id_country_of_departure = models.ForeignKey(
        Country,
        null=True,
        on_delete=models.SET_NULL,
        related_name="student_departed",
        db_column="id_country_of_departure",
    )
    id_country_of_passport = models.ForeignKey(
        Country,
        null=True,
        on_delete=models.SET_NULL,
        related_name="student_passport",
        db_column="id_country_of_passport",
    )
    passport_number = models.CharField(max_length=9, blank=True, default="")
    passport_expiration_date = models.DateField(blank=True, null=True)

    # Parents
    first_parent_full_name = models.CharField(max_length=100, blank=True, default="")
    first_parent_email = models.EmailField(blank=True, default="")
    second_parent_full_name = models.CharField(max_length=100, blank=True, default="")
    second_parent_email = models.EmailField(blank=True, default="")

    # Insurance
    polish_phone_number = PhoneNumberField(blank=True, default="")
    insurance_company = models.CharField(max_length=50, blank=True, default="")
    insurance_type = models.CharField(max_length=50, blank=True, default="")
    insurance_serial_number = models.CharField(max_length=20, blank=True, default="")
    insurance_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True)

    # Inbound/Outbound
    is_inbound = models.BooleanField(default=True)

    # Extras
    photo = models.ImageField(upload_to="student_photos/", blank=True, default="")
    notes = models.TextField(blank=True, default="")

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "student"
