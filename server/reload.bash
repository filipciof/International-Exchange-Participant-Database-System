source .venv/bin/activate
python manage.py flush
python manage.py creategroups
python manage.py createtestusers
python manage.py loaddata main/fixture.json contacts/fixture.json