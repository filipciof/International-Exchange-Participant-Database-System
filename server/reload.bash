#!/bin/bash
cd "media/contact_photos/"
find . -type f ! -name "_nodelete_*" -delete
cd "../../"
python manage.py flush --noinput