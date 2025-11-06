from django.core.management.base import BaseCommand
from main.models import ExchangeType


class Command(BaseCommand):
    help = "Creates exchange types"

    def handle(self, *args, **options):
        try:
            ExchangeType.objects.create(name="lt")
            ExchangeType.objects.create(name="st", subtype="family-to-family")
            ExchangeType.objects.create(name="st", subtype="camp")
        except:
            print("Error creating exchange")
