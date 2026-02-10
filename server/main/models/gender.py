from django.db import models


class Gender(models.IntegerChoices):
    MALE = 0
    FEMALE = 1
    NONBINARY = 2


GENDER_MAP = {
    Gender.MALE: "male",
    Gender.FEMALE: "female",
    Gender.NONBINARY: "nonbinary",
}
