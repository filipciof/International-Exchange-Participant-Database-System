from faker import Faker
from random import randint
import json


fake = Faker("pl_PL")


def make_mock_clubs() -> list[dict]:
    mock_clubs = []
    mock_club_names = ["Łódź", "Warszawa", "Kraków"]
    mock_club_districts = ["łódzkie", "mazowieckie", "małopolskie"]
    for i, element in enumerate(zip(mock_club_names, mock_club_districts)):
        name, district = element
        club = {
            "model": "main.club",
            "pk": i + 1,
            "fields": {"name": name, "district": district, "country": "Poland"},
        }
        mock_clubs.append(club)
    return mock_clubs


def make_mock_families(clubs_length: int, num_families=20) -> list[dict]:
    mock_families = []
    for i in range(num_families):
        family = {
            "model": "main.family",
            "pk": i + 1,
            "fields": {
                "name": fake.last_name(),
                "club": randint(1, clubs_length),
            },
        }
        mock_families.append(family)
    return mock_families


def make_mock_students(families_length: int, num_students=100) -> list[dict]:
    mock_students = []
    for i in range(num_students):
        student = {
            "model": "main.student",
            "pk": i + 1,
            "fields": {
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "families": [randint(1, families_length) for _ in range(randint(1, 3))],
            },
        }
        mock_students.append(student)
    return mock_students


def generate_fixture():
    mock_clubs = make_mock_clubs()
    mock_families = make_mock_families(len(mock_clubs))
    mock_students = make_mock_students(len(mock_families))

    fixture = mock_clubs + mock_families + mock_students
    with open("fixture.json", "w", encoding="utf-8") as json_file:
        json.dump(fixture, json_file, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    generate_fixture()
