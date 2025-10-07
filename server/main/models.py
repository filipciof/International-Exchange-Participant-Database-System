from django.db import models


class Club(models.Model):
    country = models.CharField(max_length=30)
    district = models.CharField(max_length=30)
    name = models.CharField(max_length=30)


class Family(models.Model):
    name = models.CharField(max_length=30)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)


class Student(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    families = models.ManyToManyField(Family)
