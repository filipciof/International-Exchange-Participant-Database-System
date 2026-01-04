from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from typing import Any, Generator
from django.http.response import HttpResponse, StreamingHttpResponse
from .models import Student, GENDER_MAP, LANG_PROF_MAP
from .serializers import StudentSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.http import HttpResponse, StreamingHttpResponse
from config.settings import MEDIA_ROOT
import os
from uuid import uuid4
from django.core.files.storage import default_storage
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework.status import (
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_204_NO_CONTENT,
)

User = get_user_model()
get_allowed_groups = ["admin", "correspondent", "club_officer", "kwm_officer", "student"]
crud_allowed_groups = ["admin", "correspondent"]


class Echo:
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


class StudentView(APIView):
    STUDENT_EXPORT_HEADERS = [
        "First name",
        "Middle name",
        "Last name",
        "Nickname",
        "Gender",
        "Date of birth",
        "Country of birth",
        "City of birth",
        "City of residence",
        "Address",
        "Height",
        "Shirt size",
        "Dietary restrictions",
        "First language",
        "Second language",
        "Second language proficiency",
        "Third language",
        "Third language proficiency",
        "Country of departure",
        "Country of passport",
        "Passport number",
        "Passport expiration date",
        "First parent full name",
        "First parent email",
        "Second parent full name",
        "Second parent email",
        "Polish phone number",
        "Insurance company",
        "Insurance type",
        "Insurance serial number",
        "Insurance amount",
        "Notes",
    ]

    def __extract_student_data(self, student) -> list:
        return [
            student.first_name,
            student.middle_name,
            student.last_name,
            student.nick_name,
            GENDER_MAP.get(student.gender, "unknown"),
            student.date_of_birth,
            (student.id_country_of_birth.name if student.id_country_of_birth else ""),
            student.city_of_birth,
            student.city_of_residence,
            student.address,
            student.height,
            student.shirt_size,
            student.dietary_restrictions,
            student.first_language,
            student.second_language,
            LANG_PROF_MAP.get(student.second_language_proficiency, ""),
            student.third_language,
            LANG_PROF_MAP.get(student.third_language_proficiency, ""),
            (
                student.id_country_of_departure.name
                if student.id_country_of_departure
                else ""
            ),
            (
                student.id_country_of_passport.name
                if student.id_country_of_passport
                else ""
            ),
            student.passport_number,
            student.passport_expiration_date,
            student.first_parent_full_name,
            student.first_parent_email,
            student.second_parent_full_name,
            student.second_parent_email,
            student.polish_phone_number,
            student.insurance_company,
            student.insurance_type,
            student.insurance_serial_number,
            student.insurance_amount,
            student.notes,
        ]

    def __get_filtered_students(self, request):
        students = Student.objects.order_by("-id")
        students = students.filter(is_active=True)
        exchange_start_year = request.query_params.get("start_year")

        if exchange_start_year:
            try:
                year = int(exchange_start_year)
                students = students.filter(
                    exchange__start_date__year=year, exchange__is_active=True
                )
            except (ValueError, TypeError):
                pass

        is_inbound = request.query_params.get("is_inbound")

        if is_inbound is not None:
            if is_inbound.lower() in ("true", "1"):
                students = students.filter(
                    exchange__is_inbound=True, exchange__is_active=True
                )
            elif is_inbound.lower() in ("false", "0"):
                students = students.filter(
                    exchange__is_inbound=False, exchange__is_active=True
                )

        if exchange_start_year or is_inbound is not None:
            students = students.distinct()

        search = request.query_params.get("search")

        if search:
            search_query = Q()
            search_fields_param = request.query_params.getlist("search_field")

            if search_fields_param:
                search_fields = search_fields_param
            else:
                search_fields = [
                    "first_name",
                    "middle_name",
                    "last_name",
                    "nick_name",
                    "city_of_birth",
                    "city_of_residence",
                    "address",
                    "dietary_restrictions",
                    "first_language",
                    "second_language",
                    "third_language",
                    "passport_number",
                    "first_parent_full_name",
                    "first_parent_email",
                    "second_parent_full_name",
                    "second_parent_email",
                    "polish_phone_number",
                    "insurance_company",
                    "insurance_type",
                    "insurance_serial_number",
                    "notes",
                ]

            for field in search_fields:
                search_query |= Q(**{f"{field}__icontains": search})

            students = students.filter(search_query)

        genders = request.query_params.getlist("gender")
        if genders:
            gender_query = Q()
            for gender in genders:
                try:
                    gender_value = int(gender)
                    gender_query |= Q(gender=gender_value)
                except (ValueError, TypeError):
                    pass
            if gender_query:
                students = students.filter(gender_query)

        shirt_sizes = request.query_params.getlist("shirt_size")
        if shirt_sizes:
            shirt_size_query = Q()
            for size in shirt_sizes:
                shirt_size_query |= Q(shirt_size=size)
            students = students.filter(shirt_size_query)

        country_of_birth = request.query_params.get("country_of_birth")
        country_of_departure = request.query_params.get("country_of_departure")
        country_of_passport = request.query_params.get("country_of_passport")

        if country_of_birth:
            students = students.filter(id_country_of_birth=country_of_birth)

        if country_of_departure:
            students = students.filter(id_country_of_departure=country_of_departure)

        if country_of_passport:
            students = students.filter(id_country_of_passport=country_of_passport)

        date_of_birth_before = request.query_params.get("date_of_birth_before")
        date_of_birth_after = request.query_params.get("date_of_birth_after")
        passport_expiration_date_before = request.query_params.get(
            "passport_expiration_date_before"
        )
        passport_expiration_date_after = request.query_params.get(
            "passport_expiration_date_after"
        )

        if date_of_birth_before:
            students = students.filter(date_of_birth__lte=date_of_birth_before)

        if date_of_birth_after:
            students = students.filter(date_of_birth__gte=date_of_birth_after)

        if passport_expiration_date_before:
            students = students.filter(
                passport_expiration_date__lte=passport_expiration_date_before
            )

        if passport_expiration_date_after:
            students = students.filter(
                passport_expiration_date__gte=passport_expiration_date_after
            )

        return students

    def __export_csv(self, students) -> StreamingHttpResponse:
        import csv

        students = students.select_related(
            "id_country_of_birth", "id_country_of_departure", "id_country_of_passport"
        )

        def generate_rows() -> Generator[Any, Any, None]:
            pseudo_buffer = Echo()
            writer = csv.writer(pseudo_buffer)
            yield writer.writerow(self.STUDENT_EXPORT_HEADERS)

            for student in students.iterator(chunk_size=1000):
                yield writer.writerow(self.__extract_student_data(student))

        response = StreamingHttpResponse(
            streaming_content=generate_rows(), content_type="text/csv"
        )
        response["Content-Disposition"] = 'attachment; filename="students.csv"'
        return response

    def __export_pdf(self, students, request) -> HttpResponse:
        students = students.select_related(
            "id_country_of_birth", "id_country_of_departure", "id_country_of_passport"
        )

        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        result_page = paginator.paginate_queryset(students, request, view=self)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            filename=buffer,
            pagesize=landscape(A4),
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=18,
        )
        elements = []
        styles = getSampleStyleSheet()
        title = Paragraph("<b>Student Export Report</b>", styles["Title"])
        elements.append(title)
        elements.append(Spacer(1, 12))

        column_indices = [
            self.STUDENT_EXPORT_HEADERS.index(col)
            for col in self.STUDENT_EXPORT_HEADERS
            if col
            not in [
                "Middle name",
                "Nickname",
                "Height",
                "Shirt size",
                "Address",
                "Dietary restrictions",
            ]
        ]
        filtered_headers = [self.STUDENT_EXPORT_HEADERS[i] for i in column_indices]
        # table_data = [self.STUDENT_EXPORT_HEADERS]
        table_data = [filtered_headers]

        for student in result_page:
            # table_data.append(self.__extract_student_data(student))
            row = self.__extract_student_data(student)
            table_data.append([row[i] for i in column_indices])

        table_data = list(map(lambda x: x[:10], table_data))
        table = Table(data=table_data)
        table.setStyle(
            tblstyle=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.green),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, 0), 9),
                    ("FONTSIZE", (0, 1), (-1, -1), 7),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.lightgrey],
                    ),
                ]
            )
        )
        elements.append(table)
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(pdf, content_type="application/pdf")
        response["Content-Disposition"] = "attachment; filename='students.pdf'"
        return response

    def get(self, request) -> Response | StreamingHttpResponse:
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        id = request.query_params.get("id")
        if id:
            student = Student.objects.get(id=id, is_active=True)
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        
        me = request.query_params.get("me")
        if me and me.lower() in ("true", "1"):
            try:
                student = Student.objects.get(id_user=request.user, is_active=True)
                serializer = StudentSerializer(student)
                return Response(serializer.data)
            except Student.DoesNotExist:
                return Response(
                    {"message": "Student profile not found for this user."},
                    status=HTTP_404_NOT_FOUND,
                )

        students = self.__get_filtered_students(request)
        export_format = request.query_params.get("export_format")

        if export_format == "csv":
            return self.__export_csv(students)
        elif export_format == "pdf":
            return self.__export_pdf(students, request)

        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        result_page = paginator.paginate_queryset(students, request, view=self)
        serializer = StudentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        user_groups = request.user.groups.values_list("name", flat=True)
        is_student_user = "student" in user_groups
        is_admin_user = bool(set(user_groups).intersection(crud_allowed_groups))

        if not is_student_user and not is_admin_user:
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        # If student user, check if they already have a student profile
        if is_student_user:
            existing_student = Student.objects.filter(
                id_user=request.user, is_active=True
            ).first()
            if existing_student:
                return Response(
                    {"message": "You already have a student profile."},
                    status=HTTP_400_BAD_REQUEST,
                )

        data = request.data.copy()

        # Auto-assign id_user for student users
        if is_student_user:
            data["id_user"] = request.user.id

        photo = request.FILES.get("photo")

        if photo:
            ext = os.path.splitext(photo.name)[1].lower() or ".bin"
            target_name = f"{uuid4().hex}{ext}"
            unique_name = default_storage.get_available_name(target_name)
            photo.name = unique_name
            data["photo"] = photo

        serializer = StudentSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)

    def delete(self, request, pk=None):
        updated = Student.objects.filter(id=pk).update(is_active=False)
        if updated == 0:
            return Response({"error": "Student not found"}, status=HTTP_404_NOT_FOUND)
        return Response(status=HTTP_204_NO_CONTENT)

    def patch(self, request, pk=None):
        user_groups = request.user.groups.values_list("name", flat=True)
        is_student_user = "student" in user_groups
        is_admin_user = bool(set(user_groups).intersection(crud_allowed_groups))

        if not is_student_user and not is_admin_user:
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            student = Student.objects.get(pk=pk, is_active=True)
        except Student.DoesNotExist:
            return Response(
                {"message": "Student not found."}, status=HTTP_404_NOT_FOUND
            )

        # If student user, verify they can only edit their own profile
        if is_student_user and student.id_user != request.user:
            return Response(
                {"message": "You can only edit your own student profile."},
                status=HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()

        # Prevent student users from changing id_user
        if is_student_user and "id_user" in data:
            del data["id_user"]

        photo = request.FILES.get("photo")
        if photo:
            if student.photo:
                old_photo_path = os.path.join(MEDIA_ROOT, str(student.photo))
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)

            ext = os.path.splitext(photo.name)[1].lower() or ".bin"
            target_name = f"{uuid4().hex}{ext}"
            unique_name = default_storage.get_available_name(target_name)
            photo.name = unique_name
            data["photo"] = photo

        serializer = StudentSerializer(student, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        student = serializer.save()
        return Response(serializer.data)


class StudentPhotoView(APIView):
    def get(self, request) -> Response | HttpResponse:
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(get_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        photo_name = request.query_params.get("photo_name", None)

        if not photo_name:
            return Response(
                {"message": "Photo name not provided."}, status=HTTP_404_NOT_FOUND
            )

        photo_location = os.path.join(MEDIA_ROOT, "student_photos/", photo_name)

        try:
            with open(photo_location, "rb") as photo:
                photo_data = photo.read()
        except IOError:
            return Response(
                {"message": "Unable to read the photo file."}, status=HTTP_404_NOT_FOUND
            )

        # File download

        # response = HttpResponse(photo_data, content_type="application/octet-stream")
        # response["Content-Disposition"] = f"attachment; filename={photo_name}"
        # return response

        return HttpResponse(photo_data, content_type="image/jpeg")


class StudentUserAccountView(APIView):
    """View for managing student user accounts (create/update)"""

    def post(self, request, pk=None):
        """Create a user account for a student"""
        user_groups = request.user.groups.values_list("name", flat=True)

        if not set(user_groups).intersection(crud_allowed_groups):
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            student = Student.objects.get(pk=pk, is_active=True)
        except Student.DoesNotExist:
            return Response(
                {"message": "Student not found."}, status=HTTP_404_NOT_FOUND
            )

        # Check if student already has a user account
        if student.id_user:
            return Response(
                {"message": "Student already has a user account."},
                status=HTTP_400_BAD_REQUEST,
            )

        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"message": "Email and password are required."},
                status=HTTP_400_BAD_REQUEST,
            )

        # Check if email is already in use
        if User.objects.filter(email=email).exists():
            return Response(
                {"message": "Email is already in use."},
                status=HTTP_400_BAD_REQUEST,
            )

        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
        )

        # Add user to student group
        student_group, _ = Group.objects.get_or_create(name="student")
        user.groups.add(student_group)

        # Link user to student
        student.id_user = user
        student.save()

        return Response(
            {"message": "User account created successfully.", "email": user.email},
            status=HTTP_201_CREATED,
        )

    def patch(self, request, pk=None):
        """Update a student's user account (email/password)"""
        user_groups = request.user.groups.values_list("name", flat=True)
        is_student_user = "student" in user_groups
        is_admin_user = bool(set(user_groups).intersection(crud_allowed_groups))

        if not is_student_user and not is_admin_user:
            return Response(
                {"message": "You are not authorized to do this."},
                status=HTTP_403_FORBIDDEN,
            )

        try:
            student = Student.objects.get(pk=pk, is_active=True)
        except Student.DoesNotExist:
            return Response(
                {"message": "Student not found."}, status=HTTP_404_NOT_FOUND
            )

        if not student.id_user:
            return Response(
                {"message": "Student does not have a user account."},
                status=HTTP_404_NOT_FOUND,
            )

        # If student user, verify they can only edit their own account
        if is_student_user and student.id_user != request.user:
            return Response(
                {"message": "You can only edit your own user account."},
                status=HTTP_403_FORBIDDEN,
            )

        user = student.id_user
        email = request.data.get("email")
        password = request.data.get("password")

        # Update email if provided
        if email and email != user.email:
            # Check if new email is already in use
            if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                return Response(
                    {"message": "Email is already in use."},
                    status=HTTP_400_BAD_REQUEST,
                )
            user.email = email
            user.username = email

        # Update password if provided
        if password:
            user.set_password(password)

        user.save()

        return Response(
            {"message": "User account updated successfully.", "email": user.email}
        )
