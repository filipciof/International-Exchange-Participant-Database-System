from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()
group_names = ["student", "correspondent", "club_officer", "kwm_officer"] 


class Command(BaseCommand):
    help = "Creates some test users"

    def handle(self, *args, **options):
        try:
            admin_user = User.objects.create_superuser(
                email="admin@mail.com", password="admin"
            )
            admin_group = Group.objects.get(name="admin")
            admin_user.groups.add(admin_group)

            for name in group_names:
                user = User.objects.create_user(email=f"{name}@mail.com", password=name)
                group = Group.objects.get(name=name)
                user.groups.add(group)

        except User.DoesNotExist:
            print("Error creating user")
        except Group.DoesNotExist:
            print("Group does not exist")
