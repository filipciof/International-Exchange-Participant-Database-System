from django.db import models
from django.core.validators import RegexValidator
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth import get_user_model

User = get_user_model()


class Country(models.Model):
    name = models.CharField(max_length=60)
    code = models.CharField(max_length=2, unique=True)

    class Meta:
        db_table = "country"


class District(models.Model):
    id_country = models.ForeignKey(
        Country, null=True, on_delete=models.SET_NULL, db_column="id_country"
    )
    number = models.CharField(
        max_length=4, unique=True, validators=[RegexValidator(regex=r"^\d{4}$")]
    )

    class Meta:
        db_table = "district"


class Club(models.Model):
    id_district = models.ForeignKey(
        District, null=True, on_delete=models.SET_NULL, db_column="id_district"
    )
    name = models.CharField(max_length=30)
    city = models.CharField(max_length=30, blank=True, default="")

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "club"


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


class Gender(models.IntegerChoices):
    MALE = 0
    FEMALE = 1
    NONBINARY = 2


GENDER_MAP = {
    Gender.MALE: "male",
    Gender.FEMALE: "female",
    Gender.NONBINARY: "nonbinary",
}


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


class LanguageProficiency(models.IntegerChoices):
    BEGINNER = 0
    CONVERSATIONAL = 1
    ADVANCED = 2
    FLUENT = 3


LANG_PROF_MAP = {
    LanguageProficiency.BEGINNER: "beginner",
    LanguageProficiency.CONVERSATIONAL: "conversational",
    LanguageProficiency.ADVANCED: "advanced",
    LanguageProficiency.FLUENT: "fluent",
}


class Student(models.Model):
    id_user = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL, db_column="id_user"
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

    # Extras
    photo = models.ImageField(upload_to="student_photos/", blank=True, default="")
    notes = models.TextField(blank=True, default="")

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "student"


class Staff(models.Model):
    id_user = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL, db_column="id_user"
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
    is_inbound = models.BooleanField(default=True)

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


class Document(models.Model):
    id_student = models.ForeignKey(
        Student, null=True, on_delete=models.SET_NULL, db_column="id_student"
    )
    id_staff = models.ForeignKey(
        Staff, null=True, on_delete=models.SET_NULL, db_column="id_staff"
    )
    id_club = models.ForeignKey(
        Club, null=True, on_delete=models.SET_NULL, db_column="id_club"
    )
    id_family = models.ForeignKey(
        Family, null=True, on_delete=models.SET_NULL, db_column="id_family"
    )
    id_district = models.ForeignKey(
        District, null=True, on_delete=models.SET_NULL, db_column="id_district"
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "document"
