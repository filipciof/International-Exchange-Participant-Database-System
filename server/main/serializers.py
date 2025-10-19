from rest_framework import serializers
from .models import Club, Family, Student


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ["id", "country", "district", "name"]


class FamilySerializer(serializers.ModelSerializer):
    club = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ["id", "name", "club"]
    
    def get_club(self, obj):
        return obj.club.name if obj.club else None


class StudentSerializer(serializers.ModelSerializer):
    families = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "families"]

    def get_families(self, obj):
        return [family.name for family in obj.families.all()]
