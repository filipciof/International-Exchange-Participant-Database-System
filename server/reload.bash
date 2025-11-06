#!/bin/bash
cd "media/contact_photos/"
find . -type f ! -name "_nodelete_*" -delete
cd "../../"
source .venv/bin/activate
python manage.py flush --noinput
python manage.py creategroups
python manage.py createtestusers
python manage.py loaddata main/fixtures/*.json