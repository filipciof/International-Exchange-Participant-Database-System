from django.core.management.base import BaseCommand, CommandError
from main.models import Exchange, ExchangeFamily, Family
from random import choice, randint
from faker import Faker
from django.db import connection
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import timedelta, datetime

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


def split_date_range(
    start_date: datetime, end_date: datetime, num_ranges: int = 4
) -> list[tuple[datetime, datetime]]:
    """
    Split a date range into non-overlapping subranges.

    Args:
        start_date: The start of the date range
        end_date: The end of the date range
        num_ranges: Number of subranges to create (2-4, default 4)

    Returns:
        List of tuples, each containing (subrange_start, subrange_end)
    """
    if num_ranges < 2 or num_ranges > 4:
        raise ValueError("num_ranges must be between 2 and 4")

    if start_date >= end_date:
        raise ValueError("start_date must be before end_date")

    # Calculate total duration
    total_duration = end_date - start_date

    # Calculate duration for each subrange
    subrange_duration = total_duration / num_ranges

    subranges = []
    current_start = start_date

    for i in range(num_ranges):
        if i == num_ranges - 1:
            # Last subrange goes exactly to end_date to avoid rounding issues
            current_end = end_date
        else:
            current_end = current_start + subrange_duration

        subranges.append((current_start, current_end))
        current_start = current_end

    return subranges


def process_exchange_chunk(exchanges: list[Exchange]):
    exchange_families_to_create = []

    for exchange in exchanges:
        date_ranges = split_date_range(
            exchange.start_date, exchange.end_date, randint(2, 4)
        )
        for start_date, end_date in date_ranges:
            exchange_family = ExchangeFamily(
                id_exchange=exchange,
                id_family=choice(
                    Family.objects.filter(id_club=exchange.id_receiving_club)
                ),
                start_date=start_date,
                end_date=end_date,
            )
            exchange_families_to_create.append(exchange_family)

    ExchangeFamily.objects.bulk_create(
        exchange_families_to_create, ignore_conflicts=True
    )
    connection.close()

    return len(exchange_families_to_create)


fake = Faker()
families = Family.objects.all()


class Command(BaseCommand):
    help = "Creates some exchange families per each exchange"

    def handle(self, *args, **options):
        num_threads = 8
        chunk_size = 500

        try:
            all_exchanges = list(
                Exchange.objects.select_related(
                    "id_student",
                    "id_receiving_club",
                    "id_sending_club",
                    "id_counsellor",
                    "id_kwm_officer",
                ).all()
            )

            total_exchanges = len(all_exchanges)
            self.stdout.write(
                f"Processing {total_exchanges} exchanges with {num_threads} threads..."
            )

            chunks = [
                all_exchanges[i : i + chunk_size]
                for i in range(0, len(all_exchanges), chunk_size)
            ]

            total_created = 0
            completed_chunks = 0

            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                futures = {
                    executor.submit(process_exchange_chunk, chunk): i
                    for i, chunk in enumerate(chunks)
                }

                for future in as_completed(futures):
                    try:
                        count = future.result()
                        total_created += count
                        completed_chunks += 1
                        self.stdout.write(
                            f"Progress: {completed_chunks}/{len(chunks)} chunks | "
                            f"Created {total_created} exchange families"
                        )
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Chunk failed: {e}"))

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created {total_created} exchange families!"
                )
            )

        except Exception as e:
            raise CommandError(f"Error creating exchange families: {str(e)}")
