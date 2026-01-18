from django.core.management.base import BaseCommand, CommandError
from main.models import Student, Exchange, Club, Staff, ExchangeType, District
from random import choice, randint
from faker import Faker
from django.db import connection
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import timedelta

with open("main/fixtures/locales_faker.json", "r") as f:
    locale_map = json.load(f)


def get_locale(country_code):
    return locale_map.get(country_code.upper(), "en_US")


def generate_date_ranges(base_date):
    """
    Generate 1-3 non-overlapping date ranges with 'st' or 'lt' labels
    st = 90-365 days (short term)
    lt = 365-730 days (long term)
    """
    ranges = []
    current_date = base_date

    num_ranges = randint(1, 3)

    for _ in range(num_ranges):
        type = choice(exchange_types)

        if type.name == "st":
            duration = randint(90, 365)
        else:
            duration = randint(365, 730)

        start_date = current_date
        end_date = start_date + timedelta(days=duration)

        ranges.append({"type": type, "start_date": start_date, "end_date": end_date})

        current_date = end_date + timedelta(days=randint(180, 365))

    return ranges


def process_student_chunk(students: list[Student]):
    exchanges_to_create = []

    for student in students:
        base_date = fake.date_between("-1000d", "+1000d")
        date_ranges = generate_date_ranges(base_date)

        # If inbound: receiving_club from home country, sending_club from foreign
        # If outbound: sending_club from home country, receiving_club from foreign
        if student.is_inbound:
            sending_club = choice(foreign_clubs) if foreign_clubs else choice(clubs)
            receiving_club = choice(home_country_clubs) if home_country_clubs else choice(clubs)
        else:
            sending_club = choice(home_country_clubs) if home_country_clubs else choice(clubs)
            receiving_club = choice(foreign_clubs) if foreign_clubs else choice(clubs)

        for date_range in date_ranges:
            id_counsellor = choice(staff)
            id_kwm_officer = choice(staff)

            exchange = Exchange(
                id_student=student,
                id_receiving_club=receiving_club,
                id_sending_club=sending_club,
                id_counsellor=id_counsellor,
                id_kwm_officer=id_kwm_officer,
                start_date=date_range["start_date"],
                end_date=date_range["end_date"],
                id_type=date_range["type"],
            )

            exchanges_to_create.append(exchange)

    Exchange.objects.bulk_create(exchanges_to_create, ignore_conflicts=True)
    connection.close()

    return len(exchanges_to_create)


fake = Faker()
exchange_types = list(ExchangeType.objects.all())
staff = list(Staff.objects.all())
clubs = list(Club.objects.all())
home_country_clubs = list(Club.objects.filter(id_district__id_country__is_home_country=True))
foreign_clubs = list(Club.objects.filter(id_district__id_country__is_home_country=False))


class Command(BaseCommand):
    help = "Creates some exchanges per each student"

    def handle(self, *args, **options):
        num_threads = 8
        chunk_size = 500

        try:
            all_students = list(
                Student.objects.select_related(
                    "id_user",
                    "id_country_of_birth",
                    "id_country_of_departure",
                    "id_country_of_passport",
                ).all()
            )

            total_students = len(all_students)
            self.stdout.write(
                f"Processing {total_students} students with {num_threads} threads..."
            )

            chunks = [
                all_students[i : i + chunk_size]
                for i in range(0, len(all_students), chunk_size)
            ]

            total_created = 0
            completed_chunks = 0

            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                futures = {
                    executor.submit(process_student_chunk, chunk): i
                    for i, chunk in enumerate(chunks)
                }

                for future in as_completed(futures):
                    try:
                        count = future.result()
                        total_created += count
                        completed_chunks += 1
                        self.stdout.write(
                            f"Progress: {completed_chunks}/{len(chunks)} chunks | "
                            f"Created {total_created} exchanges"
                        )
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Chunk failed: {e}"))

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created {total_created} exchanges!")
            )

        except Exception as e:
            raise CommandError(f"Error creating exchanges: {str(e)}")
