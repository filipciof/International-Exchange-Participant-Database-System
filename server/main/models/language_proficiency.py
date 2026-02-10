from django.db import models


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
