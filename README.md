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
- Sign-in picture:
  - https://unsplash.com/photos/group-of-people-sitting-on-bench-near-trees-duting-daytime-Q_Sei-TqSlc

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

That's why I can't load after migrating the database.
python manage.py dumpdata --exclude contenttypes --exclude auth.permission > fixture.json

High level description of the system.

The system is designed for managing international student exchanges for a country level branch of an international organization. The country of this branch of the organization is further referred to as the "home" country. The organization works in different countries. Each country can be further split into districts. Within those districts there are clubs. At the beginning of the lifecycle of the system there will be the home country, its districts and clubs. Only admins should be able to add or modify those. For now, let's assume that there will be a fixed set of foreign countries and districts. Foreign clubs might need to be added as the system grows.

There are four distinct roles in the system: admins, correspondents, club officers and students. Admins, correspondents and club officers are collectively referred to as staff. Admins should have unrestricted access. They should be the only ones capable of creating new staff members. There are two major kinds of students: inbound and outbound. Inbound students are coming to the home country. Outbound students are coming to foreign countries.

Inbound students are created by correspondent. When correspondent creates the inbound student he provides the following information: name, surname, country, district and club they are coming from (sending). The country, district and club information is provided in a cascading pattern (first country, then district, finally club). Correspondent should be automatically assigned to the student he created. Finally, correspondent provides student's email and creates an account. An email with one time login link is sent to the student's inbox. When the student uses the link he is redirected to the website where he is forced to set up a password. Now, after logging in the student is capable of filling in and possibly modifying remaining information. Student should also be capable of uploading document files (docx, pdf) and a profile picture. Correspondent may also upload document files to student account. Student should also be able to change his own password and email address (with email confirmation). When the correspondent sets the club the student is coming to (receiving), that's when the student becomes visible to that club's club officer. Club officer is the one who assigns families to students. Students may be assigned to many families in consecutive time periods.

Outbound students are created by club officers. When club officer creates the outbound student he provides the following information: name and surname. The country, district and club are automatically assigned based on club officers information. Then the club officer provides the student's email address and the student account is created in much the same way like with correspondents and inbound students. At that point the student can already be viewed by the correspondent and he can set the receiving club for the student.

Correspondents are capable of creating foreign clubs (because they may have to send a student to a club which does not yet exist or receive a student from a club which does not yet exist).
Both club officers and correspondents can only be from a club from the home country.
Club officers have no need to view or modify any clubs.
When admins create staff members provide pretty much the same information: name, surname, group(role), district and club (since staff can only be from the home country). This should be the default not a rule because admins should be able to bypass any rule. Then admins provide an email and an account is created in much the same way like students.

TODO:

<!-- - Test filling in forms differently. -->
<!-- - Don't show form fields until the object is fetched. (it's usually rather fast).-->
<!-- - Can't remove club completely (cause it's required/ FamilyDetail). -->

Less important refactors:
- Editable (EditableHeaders and clubs/EditableLocation use it for now).
- Move mutations from pages to forms.

Tests:
- Unit tests on the backend.
- Manual testing on the frontend.

Major features:
- Exporting dialog/logic.
- Custom form creation.
- django-auditlog.

- Istnieje już club o tej wartości pola number.
---

- Don't use MyAutocomplete, instead restrict the option set instead.
<!-- - Regenerate the database with the academic year set for exchanges. -->
<!-- - Using zod and react hook form for editable elements in the StudentDetail. -->
<!-- - Filtering students by height. -->
<!-- - Removing the errors from console by catching them and doing nothing. -->

python manage.py makemessages -l pl
python manage.py compilemessages

The app disregards region code in the language settings.

ErrorDocument 404 /index.html

On the server, there is Python 3.9 so I cannot use all the typing annotations like, eg. "str | None".