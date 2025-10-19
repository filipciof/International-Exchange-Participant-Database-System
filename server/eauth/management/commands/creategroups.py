from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

group_names = ["student", "correspondent", "club_officer", "kwm_officer", "admin"]


class Command(BaseCommand):
    help = "Creates the necessary groups for the application"

    def handle(self, *args, **options):
        for name in group_names:
            group, created = Group.objects.get_or_create(name=name)
            if created:
                print(f"Group '{name}' created successfully.")
            else:
                print(f"Group '{name}' already exists.")
