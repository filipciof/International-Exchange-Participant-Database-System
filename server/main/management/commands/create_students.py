from django.core.management.base import BaseCommand, CommandError
from main.models import Student, Country, Gender, LanguageProficiency
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


def generate_shirt_size(height_m):
    if height_m < 1.55:
        return choices(["XS", "S", "M"], weights=[50, 40, 10])[0]
    elif height_m < 1.65:
        return choices(["XS", "S", "M", "L"], weights=[10, 50, 35, 5])[0]
    elif height_m < 1.75:
        return choices(["S", "M", "L", "XL"], weights=[5, 40, 45, 10])[0]
    elif height_m < 1.85:
        return choices(["M", "L", "XL", "XXL"], weights=[10, 40, 40, 10])[0]
    else:
        return choices(["L", "XL", "XXL"], weights=[20, 50, 30])[0]


def generate_student(students_to_create):
    id_country_of_birth = choice(countries)
    id_country_of_departure = choices(
        [id_country_of_birth, choice(countries)], weights=[80, 20]
    )[0]
    id_country_of_passport = choice([id_country_of_birth, id_country_of_departure])

    locale_code = get_locale(id_country_of_passport.code)
    fake = Faker(locale_code)

    fake_dict = {
        Gender.MALE: (fake.first_name_male, fake.last_name_male),
        Gender.FEMALE: (fake.first_name_female, fake.last_name_female),
        Gender.NONBINARY: (fake.first_name_nonbinary, fake.last_name_nonbinary),
    }

    gender = choice([Gender.MALE, Gender.FEMALE, Gender.NONBINARY])

    fake_first_name, fake_last_name = fake_dict[gender]

    height_m = gauss(1.70, 0.10)
    height_m = round(max(1.40, min(2.10, height_m)), 2)
    first_language = Locale.parse(locale_code).get_language_name("en")

    student = Student(
        first_name=remove_special_characters(unidecode(fake_first_name())),
        last_name=remove_special_characters(unidecode(fake_last_name())),
        gender=gender,
        date_of_birth=fake.date_of_birth(minimum_age=16, maximum_age=22),
        id_country_of_birth=id_country_of_birth,
        city_of_birth=remove_special_characters(unidecode(fake.city())),
        city_of_residence=remove_special_characters(unidecode(fake.city())),
        address=unidecode(fake.address()),
        height=height_m,
        shirt_size=generate_shirt_size(height_m),
        dietary_restrictions=choices(
            ["", "vegetarian", "vegan", "medical"], weights=[60, 25, 10, 5]
        )[0],
        first_language=Locale.parse(locale_code).get_language_name("en"),
        second_language=(
            "English"
            if first_language != "English"
            else choice(["Spanish", "French", "Italian"])
        ),
        second_language_proficiency=(
            choice(
                [
                    LanguageProficiency.BEGINNER,
                    LanguageProficiency.CONVERSATIONAL,
                    LanguageProficiency.ADVANCED,
                    LanguageProficiency.FLUENT,
                ]
            )
            if first_language == "English"
            else choice(
                [
                    LanguageProficiency.CONVERSATIONAL,
                    LanguageProficiency.ADVANCED,
                    LanguageProficiency.FLUENT,
                ]
            )
        ),
        id_country_of_departure=id_country_of_departure,
        id_country_of_passport=id_country_of_passport,
        passport_number=fake.numerify("#########"),
        passport_expiration_date=fake.date_between(start_date="+6m", end_date="+2y"),
    )
    students_to_create.append(student)


countries = list(Country.objects.all())


class Command(BaseCommand):
    help = "Creates some random students"

    def handle(self, *args, **options):
        count = 50_000
        batch_size = 1000

        if not countries:
            self.stdout.write(
                self.style.ERROR(
                    "No countries found in database. Please create countries first."
                )
            )

        fake = Faker()
        created_count = 0

        try:
            with transaction.atomic():
                students_to_create = []

                for i in range(count):
                    generate_student(students_to_create)

                    if len(students_to_create) >= batch_size:
                        Student.objects.bulk_create(
                            students_to_create, ignore_conflicts=True
                        )
                        created_count += len(students_to_create)
                        self.stdout.write(
                            f"Created {created_count}/{count} students..."
                        )
                        students_to_create = []

                if students_to_create:
                    Student.objects.bulk_create(
                        students_to_create, ignore_conflicts=True
                    )
                    created_count += len(students_to_create)

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created {created_count} students!")
            )

        except Exception as e:
            raise CommandError(f"Error creating students: {str(e)}")
