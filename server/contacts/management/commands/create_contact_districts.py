from django.core.management.base import BaseCommand, CommandError
from main.models import District
from contacts.models import Contact, ContactDistrict
from random import sample, randint


class Command(BaseCommand):
    help = "Creates some random contacts"

    def handle(self, *args, **options):
        contacts = Contact.objects.all()
        contact_districts_to_create = []

        try:
            for contact in contacts:
                possible_districts = list(
                    District.objects.filter(id_country=contact.id_country)
                )
                num_of_districts = randint(1, 3)
                districts = (
                    sample(
                        possible_districts,
                        num_of_districts,
                    )
                    if len(possible_districts) >= num_of_districts
                    else (possible_districts if possible_districts else [])
                )
                for district in districts:
                    contact_district = ContactDistrict(
                        id_contact=contact, id_district=district
                    )
                    contact_districts_to_create.append(contact_district)

            ContactDistrict.objects.bulk_create(
                contact_districts_to_create, ignore_conflicts=True
            )

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created contact districts!")
            )

        except Exception as e:
            raise CommandError(f"Error creating contact districts: {str(e)}")
