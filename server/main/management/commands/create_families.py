from django.core.management.base import BaseCommand, CommandError
from main.models import Club, Family
from random import choice
from faker import Faker
from django.db import transaction
import json
from unidecode import unidecode

with open("main/fixtures/locales_faker.json", "r") as f:
    locale_map = json.load(f)


def get_locale(country_code):
    return locale_map.get(country_code.upper(), "en_US")


def remove_special_characters(text):
    return (
        text.replace("@", "")
        .replace(".", "")
        .replace(" ", "")
        .replace("~", "")
        .replace("`", "")
    )


class Command(BaseCommand):
    help = "Creates some random families"

    def handle(self, *args, **options):
        count = 40_000
        batch_size = 1000

        clubs = list(Club.objects.all())

        if not clubs:
            self.stdout.write(
                self.style.ERROR(
                    "No clubs found in database. Please create clubs first."
                )
            )

        fake = Faker()
        created_count = 0

        try:
            with transaction.atomic():
                families_to_create = []

                for i in range(count):
                    club = choice(clubs)
                    country_code = club.id_district.id_country.code
                    locale_code = get_locale(country_code)
                    fake = Faker(locale_code)
                    name = remove_special_characters(unidecode(fake.last_name()))
                    city = remove_special_characters(unidecode(fake.city()))
                    address = unidecode(fake.address())

                    family = Family(id_club=club, name=name, city=city, address=address)
                    families_to_create.append(family)

                    if len(families_to_create) >= batch_size:
                        Family.objects.bulk_create(
                            families_to_create, ignore_conflicts=True
                        )
                        created_count += len(families_to_create)
                        self.stdout.write(
                            f"Created {created_count}/{count} families..."
                        )
                        families_to_create = []

                if families_to_create:
                    Family.objects.bulk_create(
                        families_to_create, ignore_conflicts=True
                    )
                    created_count += len(families_to_create)

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created {created_count} families!")
            )

        except Exception as e:
            raise CommandError(f"Error creating families: {str(e)}")
