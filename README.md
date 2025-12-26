# International-Exchange-Participant-Database-System

Resources:

- Authentication setup
  - https://betterstack.com/community/guides/scaling-python/django-postgresql/
  - https://medium.com/@therealak12/authenticate-using-email-instead-of-username-in-django-rest-framework-857645037bab
  - https://github.com/PikoCanFly/JWT-HTTPCookies-Django-DRF-NEXT.JS
  - https://blog.stackademic.com/django-react-secure-authentication-using-http-only-cookie-ac718f0a2797
  - https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej
- Peoples' faces
  - https://www.kaggle.com/competitions/deepfake-detection-challenge/discussion/121173
  - https://github.com/microsoft/DigiFace1M?tab=readme-ov-file
  - https://susanqq.github.io/UTKFace/
- Lists of countries:
  - https://stefangabos.github.io/world_countries/
  - https://datahub.io/core/country-list

Django admin app migrations:
.venv/lib/python<version>/site-packages/django/contrib/admin/migrations/

Clearing Vite cache in case of this weird "" MIME type error.
rm -rf client/node_modules/.vite/

Dropping all tables in postgresql:
psql -U admin -W -d iepds

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

Dumping the whole database:
pg_dump -U admin -h localhost -d iepds > ~/repos/IEPDS/server/pg_iepds.sql

Loading the dump (drop all schema before doing this):
psql -U admin -h localhost -d iepds < ~/repos/IEPDS/server/pg_iepds.sql

country: 249
district: 600
contact: 1000
contactDistrict: 1537
club: 4000
family: 40 000
familyMember: 160 315
student: 50 009
staff: 12 000
exchangeType: 3
exchange: 99 987
exchangeFamily: 299 751

TODO:

- Individual role based pages.
- Adding and uploading and deleting documents to student.
- For admin, creating new users (either students or staff).
- Regenerate the database with the academic year set for exchanges.
- Using zod and react hook form for editable elements in the StudentDetail.
- Filtering students by height.