#!/bin/bash

KEEP_FILES=(
    "chenpihsia.jpg"
    "elisabethmarchal.jpg"
    "frejajansson.jpg"
    "fryderykczak.jpg"
    "malikadesmet.jpg"
    "thierrygaillard.jpg"
    "urszulataranek.jpg"
    "vincentsudin.jpg"
    "williamhaglund.jpg"
    "yutingchen.jpg"
)

cd "media/contact_photos/"
find . -type f | grep -v -E "$(IFS=\|; echo "${KEEP_FILES[*]}")" | xargs rm -f
cd "../../"

source .venv/bin/activate
python manage.py flush --noinput
python manage.py creategroups
python manage.py createtestusers
python manage.py loaddata main/fixture.json contacts/fixture.json
