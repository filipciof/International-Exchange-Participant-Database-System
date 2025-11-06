from django.core.management.base import BaseCommand, CommandError
from main.models import FamilyMember, Family, Gender
from random import choice, randint
from faker import Faker
from django.db import connection
import json
from unidecode import unidecode
from concurrent.futures import ThreadPoolExecutor, as_completed

# Weird @ sign in names
# Foreign language occupation should be changed to English: DONE
# Clean emails (lowercase, non-letter characters around the separating dot)

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


def process_family_chunk(families):
    """Process a chunk of families in a thread"""
    familyMembers_to_create = []

    for family in families:
        country_code = family.id_club.id_district.id_country.code
        locale_code = get_locale(country_code)
        fake = Faker(locale_code)

        is_head_of_family_male = choice([True, False])
        is_head_of_family_female = not is_head_of_family_male

        first_name_male = unidecode(fake.first_name_male())
        first_name_male = remove_special_characters(first_name_male)

        dad = FamilyMember(
            id_family=family,
            first_name=first_name_male,
            last_name=family.name,
            gender=Gender.MALE,
            date_of_birth=fake.date_of_birth(minimum_age=40, maximum_age=80),
            email=f"{first_name_male.lower()}.{family.name.lower()}@example.com",
            phone=fake.msisdn(),
            is_head_of_family=is_head_of_family_male,
            occupation=Faker().job_male(),
        )

        first_name_female = unidecode(fake.first_name_female())
        first_name_female = remove_special_characters(first_name_female)

        mom = FamilyMember(
            id_family=family,
            first_name=first_name_female,
            last_name=family.name,
            gender=Gender.FEMALE,
            date_of_birth=fake.date_of_birth(minimum_age=40, maximum_age=80),
            email=f"{first_name_female.lower()}.{family.name.lower()}@example.com",
            phone=fake.msisdn(),
            is_head_of_family=is_head_of_family_female,
            occupation=Faker().job_female(),
        )

        familyMembers_to_create.append(dad)
        familyMembers_to_create.append(mom)

        fake_dict = {
            Gender.MALE: fake.first_name_male,
            Gender.FEMALE: fake.first_name_female,
            Gender.NONBINARY: fake.first_name_nonbinary,
        }

        num_of_kids = randint(1, 3)

        for _ in range(num_of_kids):
            gender = choice([Gender.MALE, Gender.FEMALE, Gender.NONBINARY])
            fake_first_name = fake_dict[gender]
            child = FamilyMember(
                id_family=family,
                first_name=remove_special_characters(unidecode(fake_first_name())),
                last_name=family.name,
                gender=gender,
                date_of_birth=fake.date_of_birth(minimum_age=16, maximum_age=22),
            )
            familyMembers_to_create.append(child)

    # Bulk create for this chunk
    FamilyMember.objects.bulk_create(familyMembers_to_create, ignore_conflicts=True)
    connection.close()

    return len(familyMembers_to_create)


class Command(BaseCommand):
    help = "Creates some family members per each family"

    def handle(self, *args, **options):
        num_threads = 8
        chunk_size = 500

        try:
            # Get all families with related data
            all_families = list(
                Family.objects.select_related("id_club__id_district__id_country").all()
            )

            total_families = len(all_families)
            self.stdout.write(
                f"Processing {total_families} families with {num_threads} threads..."
            )

            # Split into chunks
            chunks = [
                all_families[i : i + chunk_size]
                for i in range(0, len(all_families), chunk_size)
            ]

            total_created = 0
            completed_chunks = 0

            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                futures = {
                    executor.submit(process_family_chunk, chunk): i
                    for i, chunk in enumerate(chunks)
                }

                for future in as_completed(futures):
                    try:
                        count = future.result()
                        total_created += count
                        completed_chunks += 1
                        self.stdout.write(
                            f"Progress: {completed_chunks}/{len(chunks)} chunks | "
                            f"Created {total_created} family members"
                        )
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Chunk failed: {e}"))

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created {total_created} familyMembers!"
                )
            )

        except Exception as e:
            raise CommandError(f"Error creating familyMembers: {str(e)}")
