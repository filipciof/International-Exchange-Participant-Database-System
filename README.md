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
  - Admin:
    - Creating new users (either students or staff) (for existing students and staff or for nonexistent).
    - Changing passwords/emails.
    - Fully unrestricted access.
  - Student:
    - Adjusting your own personal information.
    - Uploading monthly/biweekly reports.
    - Can see his host families but cannot edit them.
  - Correspondent/KWM officer:
    - Basically admin except cannot create new users or change them.
  - Club officer:
    - Can see everything but can only modify data related to his club.
- Tabulate StudentForm.
- Create users for some existing staff and students.
---
- How to add a unique indentifier for these lists in React?
  - This is important both in terms of the error that happens in the console and the UX.
- Regenerate the database with the academic year set for exchanges.
- Using zod and react hook form for editable elements in the StudentDetail.
- Filtering students by height.
- Removing the errors from console by catching them and doing nothing.
