from django.core.management.base import BaseCommand
from main.models import Country, District
from random import sample, choice


class Command(BaseCommand):
    help = "Creates some random districts"

    def handle(self, *args, **options):
        countries = list(Country.objects.all())

        if not countries:
            self.stdout.write(
                self.style.ERROR(
                    "No countries found in database. Please create countries first."
                )
            )
        
        all_codes = [f'{i:04d}' for i in range(1, 10000)]
        selected_codes = sample(all_codes, 600)

        districts_to_create = []
        for code in selected_codes:
            country = choice(countries)
            district = District(
                number=code,
                id_country=country
            )
            districts_to_create.append(district)

        District.objects.bulk_create(districts_to_create)