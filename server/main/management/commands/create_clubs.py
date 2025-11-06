from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from main.models import District, Club
from random import choice
from faker import Faker
import json
from unidecode import unidecode


def generate_club_names(count):
    names = []
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

    for letter in letters:
        names.append(f"Club {letter}")
        if len(names) >= count:
            return names[:count]

    counter = 1
    while len(names) < count:
        for letter in letters:
            names.append(f"Club {letter}{counter}")
            if len(names) >= count:
                return names[:count]
        counter += 1

    return names[:count]


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
    help = "Creates some random clubs"

    def handle(self, *args, **options):
        count = 4000
        batch_size = 1000

        districts = list(District.objects.all())

        if not districts:
            self.stdout.write(
                self.style.ERROR(
                    "No districts found in database. Please create districts first."
                )
            )

        fake = Faker()
        # club_names = generate_club_names(count)
        created_count = 0

        try:
            with transaction.atomic():
                clubs_to_create = []

                for i in range(count):
                    district = choice(districts)
                    country_code = district.id_country.code
                    locale_code = get_locale(country_code)
                    fake = Faker(locale_code)
                    city = remove_special_characters(unidecode(fake.city()))

                    club = Club(
                        id_district=district,
                        name=f"{city} Club",
                        city=city,
                    )
                    clubs_to_create.append(club)

                    if len(clubs_to_create) >= batch_size:
                        Club.objects.bulk_create(clubs_to_create, ignore_conflicts=True)
                        created_count += len(clubs_to_create)
                        self.stdout.write(f"Created {created_count}/{count} clubs...")
                        clubs_to_create = []

                if clubs_to_create:
                    Club.objects.bulk_create(clubs_to_create, ignore_conflicts=True)
                    created_count += len(clubs_to_create)

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created {created_count} clubs!")
            )

        except Exception as e:
            raise CommandError(f"Error creating clubs: {str(e)}")
