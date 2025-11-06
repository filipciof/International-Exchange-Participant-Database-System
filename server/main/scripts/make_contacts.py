from faker import Faker
from random import randint, choice
import json

fake = Faker("pl_PL")

fakers = {
    "Poland": Faker("pl_PL"),
    "Belgium": Faker("fr_BE"),
    "Taiwan": Faker("zh_TW"),
    "Sweden": Faker("sv_SE"),
}

countries = list(fakers.keys())


def generate_random_districts(num_districts):
    return [f"D{randint(1000, 9999)}" for _ in range(num_districts)]


def generate_fixture(num_men=5, num_women=5):
    fixture = []

    for _ in range(num_men):
        country = choice(countries)
        fake = fakers[country]

        contact = {
            "model": "contacts.contact",
            "pk": len(fixture) + 1,
            "fields": {
                "first_name": fake.first_name_male(),
                "last_name": fake.last_name(),
                "email": fake.email(),
                "phone": fake.phone_number(),
                "country": country,
                "districts": generate_random_districts(randint(1, 5)),
                "photo": "media/contact_photos/",
            },
        }

        fixture.append(contact)

    for _ in range(num_women):
        country = choice(countries)
        fake = fakers[country]

        contact = {
            "model": "contacts.contact",
            "pk": len(fixture) + 1,
            "fields": {
                "first_name": fake.first_name_female(),
                "last_name": fake.last_name(),
                "email": fake.email(),
                "phone": fake.phone_number(),
                "country": country,
                "districts": generate_random_districts(randint(1, 5)),
                "photo": "media/contact_photos/",
            },
        }

        fixture.append(contact)

    with open("fixture.json", "w", encoding="utf-8") as json_file:
        json.dump(fixture, json_file, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    generate_fixture()
