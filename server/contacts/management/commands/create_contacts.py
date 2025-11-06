from django.core.management.base import BaseCommand, CommandError
from main.models import Country, Gender
from contacts.models import Contact
from random import sample, choice, randint
from pathlib import Path
import json
from faker import Faker
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
        .replace("'", "")
    )


class Command(BaseCommand):
    help = "Creates some random contacts"

    def handle(self, *args, **options):
        countries = list(Country.objects.all())

        if not countries:
            self.stdout.write(
                self.style.ERROR(
                    "No countries found in database. Please create countries first."
                )
            )

        contacts_to_create = []
        try:
            photos = Path("media/contact_photos/")
            for photo in photos.iterdir():
                if not (photo.is_file() and photo.suffix.lower() == ".jpg"):
                    continue
                country = choice(countries)
                locale_code = get_locale(country.code)
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
                tmp = randint(0, 2)
                is_longterm, is_family_to_family, is_camp = tuple(
                    i == tmp for i in range(3)
                )

                contact = Contact(
                    first_name=first_name,
                    last_name=last_name,
                    gender=gender,
                    email=f"{first_name.lower()}.{last_name.lower()}@example.com",
                    phone=fake.msisdn(),
                    id_country=country,
                    photo=f"contact_photos/{photo.name}",
                    is_longterm=is_longterm,
                    is_family_to_family=is_family_to_family,
                    is_camp=is_camp,
                )

                contacts_to_create.append(contact)

            Contact.objects.bulk_create(contacts_to_create, ignore_conflicts=True)
        
            self.stdout.write(
                self.style.SUCCESS(f"Successfully created contacts!")
            )

        except Exception as e:
            raise CommandError(f"Error creating contacts: {str(e)}")