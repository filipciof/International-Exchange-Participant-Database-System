from django.db import models
from main.models.student import Student
from main.models.staff import Staff
from main.models.club import Club, District
from main.models.family import Family


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

    name = models.CharField(max_length=100, default="")
    file = models.FileField(upload_to="documents/", blank=True, default="")
    description = models.TextField(blank=True, default="")
    uploaded_at = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "document"
