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

Dropping all tables in postgresql:
psql -U admin -W -d iepds

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

Dumping the whole database:
pg_dump -U admin -h localhost -d iepds > ~/repos/IEPDS/server/pg_iepds.sql

Loading the dump (drop all schema before doing this):
psql -U admin -h localhost -d iepds < ~/repos/IEPDS/server/pg_iepds.sql

TODO:

- Filtering student by exchange information (current exchange inbound students shown by default).
- Filtering student by dates of birth and passport expiration.
- URL parameters for pagination and filters.
- Downloading student table as a csv and pdf file.
- Adding and uploading and deleting documents to student.
- URL parameters for Contacts.
- Using zod and react hook form for editable elements in the StudentDetail.
- Filtering students by height.
