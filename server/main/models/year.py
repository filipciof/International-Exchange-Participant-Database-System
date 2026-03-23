from django.db import models
from django.core.validators import RegexValidator


class Year(models.Model):
    value = models.CharField(
        max_length=9,
        unique=True,
        validators=[RegexValidator(regex=r"^\d{4}/\d{2}$")],
    )
    is_current = models.BooleanField(default=False)

    class Meta:
        db_table = "year"

    def save(self, *args, **kwargs):
        if self.is_current:
            Year.objects.exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)
