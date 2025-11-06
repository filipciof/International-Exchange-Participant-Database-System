from django.core.management.base import BaseCommand, CommandError
from main.models import Staff, Club, Gender
from random import choice, choices, gauss
from faker import Faker
from django.db import transaction
import json
from unidecode import unidecode
from babel import Locale

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


def generate_staff(staff_to_create):
    id_club = choice(clubs)
    country_code = id_club.id_district.id_country.code
    locale_code = get_locale(country_code)
    fake = Faker(locale_code)

    fake_dict = {
        Gender.MALE: (fake.first_name_male, fake.last_name_male),
        Gender.FEMALE: (fake.first_name_female, fake.last_name_female),
        Gender.NONBINARY: (fake.first_name_nonbinary, fake.last_name_nonbinary),
    }

    gender = choice([Gender.MALE, Gender.FEMALE, Gender.NONBINARY])

    fake_first_name, fake_last_name = fake_dict[gender]

    first_name = remove_special_characters(unidecode(fake_first_name()))
    last_name = remove_special_characters(unidecode(fake_last_name()))

    staff = Staff(
        id_club=choice(clubs),
        first_name=first_name,
        last_name=last_name,
        gender=gender,
        email=f"{first_name.lower()}.{last_name.lower()}@example.com",
        phone=fake.msisdn(),
    )

    staff_to_create.append(staff)


clubs = list(Club.objects.all())


class Command(BaseCommand):
    help = "Creates some random staff members"

    def handle(self, *args, **options):
        count = 12_000
        batch_size = 1000

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
                staff_to_create = []

                for i in range(count):
                    generate_staff(staff_to_create)

                    if len(staff_to_create) >= batch_size:
                        Staff.objects.bulk_create(
                            staff_to_create, ignore_conflicts=True
                        )
                        created_count += len(staff_to_create)
                        self.stdout.write(f"Created {created_count}/{count} staff...")
                        staff_to_create = []

                if staff_to_create:
                    Staff.objects.bulk_create(staff_to_create, ignore_conflicts=True)
                    created_count += len(staff_to_create)

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created {created_count} staff!")
            )

        except Exception as e:
            raise CommandError(f"Error creating staff: {str(e)}")
