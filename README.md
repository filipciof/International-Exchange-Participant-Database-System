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
