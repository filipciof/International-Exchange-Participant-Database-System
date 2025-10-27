from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from config.settings import DEBUG

User = get_user_model()

group_name_to_password = (
    {
        "admin": "admin",
        "student": "student",
        "correspondent": "correspondent",
        "club_officer": "club_officer",
        "kwm_officer": "kwm_officer",
    }
    if DEBUG
    else {
        "admin": "q#It9c,V3>9",
        "student": "YnfT3/25]1W",
        "correspondent": "96}zbWy9Lv#",
        "club_officer": "2:m25Yu,z01",
        "kwm_officer": ")z98CN5/*>z",
    }
)

group_names = ["student", "correspondent", "club_officer", "kwm_officer"]


class Command(BaseCommand):
    help = "Creates some test users"

    def handle(self, *args, **options):
        try:
            admin_user = User.objects.create_superuser(
                email="admin@mail.com", password=group_name_to_password["admin"]
            )
            admin_group = Group.objects.get(name="admin")
            admin_user.groups.add(admin_group)

            for name in group_names:
                user = User.objects.create_user(
                    email=f"{name}@mail.com", password=group_name_to_password[name]
                )
                group = Group.objects.get(name=name)
                user.groups.add(group)

        except User.DoesNotExist:
            print("Error creating user")
        except Group.DoesNotExist:
            print("Group does not exist")
