from rest_framework import serializers
from .models import Club, Family, Student


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ["id", "country", "district", "name"]


class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ["id", "name", "club"]


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "families"]
