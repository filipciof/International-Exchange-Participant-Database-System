from django.utils.translation import gettext as _
from django_filters import rest_framework as filters
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from typing import Any, Generator
from django.http import FileResponse
from django.http.response import HttpResponse, StreamingHttpResponse
from django.db.models import Q
from django.db import transaction
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.generics import (
    GenericAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
from main.models import Club, Student, Exchange, GENDER_MAP, LANG_PROF_MAP
from main.serializers import (
    CreateStudentSerializer,
    StudentSerializer,
    StudentUserAccountUpdateSerializer,
)
from main.permissions import (
    StudentPermission,
    get_active_role,
    Roles,
)
from main.selectors import student_queryset_for
from django.shortcuts import get_object_or_404
from eauth.utils import send_activation_email, send_email_change_verification
import io

User = get_user_model()


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


def _extract_student_data(student) -> list:
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
        (student.id_country_of_passport.name if student.id_country_of_passport else ""),
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


class Echo:
    def write(self, value):
        return value


class StudentFilter(filters.FilterSet):
    search = filters.CharFilter(method="filter_search")
    search_field = filters.CharFilter(method="noop")
    is_inbound = filters.BooleanFilter()
    gender = filters.BaseInFilter(field_name="gender")
    shirt_size = filters.BaseInFilter(field_name="shirt_size")
    sending_club = filters.NumberFilter(method="filter_sending_club")
    receiving_club = filters.NumberFilter(method="filter_receiving_club")
    date_of_birth_before = filters.DateFilter(
        field_name="date_of_birth", lookup_expr="lte"
    )
    date_of_birth_after = filters.DateFilter(
        field_name="date_of_birth", lookup_expr="gte"
    )
    exchange_start_date_before = filters.DateFilter(method="filter_exchange_start_date_before")
    exchange_start_date_after = filters.DateFilter(method="filter_exchange_start_date_after")
    exchange_end_date_before = filters.DateFilter(method="filter_exchange_end_date_before")
    exchange_end_date_after = filters.DateFilter(method="filter_exchange_end_date_after")
    start_year = filters.CharFilter(method="filter_start_year")

    class Meta:
        model = Student
        fields = []

    def noop(self, queryset, name, value):
        return queryset

    def filter_sending_club(self, queryset, name, value):
        return queryset.filter(
            exchange__id_sending_club=value, exchange__is_active=True
        ).distinct()

    def filter_receiving_club(self, queryset, name, value):
        return queryset.filter(
            exchange__id_receiving_club=value, exchange__is_active=True
        ).distinct()

    def filter_exchange_start_date_before(self, queryset, name, value):
        return queryset.filter(
            exchange__start_date__lte=value, exchange__is_active=True
        ).distinct()

    def filter_exchange_start_date_after(self, queryset, name, value):
        return queryset.filter(
            exchange__start_date__gte=value, exchange__is_active=True
        ).distinct()

    def filter_exchange_end_date_before(self, queryset, name, value):
        return queryset.filter(
            exchange__end_date__lte=value, exchange__is_active=True
        ).distinct()

    def filter_exchange_end_date_after(self, queryset, name, value):
        return queryset.filter(
            exchange__end_date__gte=value, exchange__is_active=True
        ).distinct()

    def filter_start_year(self, queryset, name, value):
        return queryset.filter(
            exchange__year=value, exchange__is_active=True
        ).distinct()

    def filter_search(self, queryset, name, value):
        search_fields = self.request.GET.getlist("search_field")
        if not search_fields:
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

        query = Q()
        for field in search_fields:
            query |= Q(**{f"{field}__icontains": value})
        return queryset.filter(query)


class StudentListView(ListCreateAPIView):
    serializer_class = StudentSerializer
    permission_classes = [StudentPermission]
    filterset_class = StudentFilter

    def get_queryset(self):
        return student_queryset_for(self.request.user).order_by("-id")

    def create(self, request, *args, **kwargs):
        active_role = get_active_role(request)
        if not active_role:
            return Response(
                {
                    "detail": _(
                        "X-Active-Role header is required and must match one of your roles."
                    )
                },
                status=400,
            )

        serializer = CreateStudentSerializer(
            data=request.data,
            context={"user": request.user, "active_role": active_role},
        )
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        club = Club.objects.get(id=data["id_club"], is_active=True)

        with transaction.atomic():
            user = User.objects.create_user(email=data["email"], password=None)
            user.set_unusable_password()
            user.save(update_fields=["password"])
            student_group = Group.objects.get(name="student")
            user.groups.add(student_group)

            student = Student.objects.create(
                id_user=user,
                first_name=data["first_name"],
                last_name=data["last_name"],
                is_inbound=data["is_inbound"],
                is_active=True,
            )

            exchange_kwargs = {
                "id_student": student,
                "id_sending_club": club,
                "is_active": True,
            }

            if active_role in (Roles.CORRESPONDENT, Roles.KWM_OFFICER):
                exchange_kwargs["id_counsellor"] = request.user.id_staff

            Exchange.objects.create(**exchange_kwargs)

        send_activation_email(user)

        response_serializer = StudentSerializer(student)
        return Response(response_serializer.data, status=HTTP_201_CREATED)


class StudentDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = StudentSerializer
    permission_classes = [StudentPermission]
    queryset = Student.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        if instance.id_user:
            instance.id_user.is_active = False
            instance.id_user.save(update_fields=["is_active"])
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class StudentMeView(GenericAPIView):
    serializer_class = StudentSerializer
    permission_classes = [StudentPermission]

    def get_object(self):
        return get_object_or_404(Student, id_user=self.request.user, is_active=True)

    def get(self, request):
        student = self.get_object()
        serializer = self.get_serializer(student)
        return Response(serializer.data)

    def patch(self, request):
        student = self.get_object()
        self.check_object_permissions(request, student)
        serializer = self.get_serializer(student, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StudentExportView(GenericAPIView):
    permission_classes = [StudentPermission]
    filterset_class = StudentFilter

    def get_queryset(self):
        return student_queryset_for(self.request.user).order_by("-id")

    def get(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        export_format = request.query_params.get("export_format")

        if export_format == "csv":
            return self._export_csv(queryset)
        elif export_format == "pdf":
            return self._export_pdf(queryset, request)

        return Response(status=400)

    def _export_csv(self, students) -> StreamingHttpResponse:
        import csv

        students = students.select_related(
            "id_country_of_birth", "id_country_of_departure", "id_country_of_passport"
        )

        def generate_rows() -> Generator[Any, Any, None]:
            pseudo_buffer = Echo()
            writer = csv.writer(pseudo_buffer)
            yield writer.writerow(STUDENT_EXPORT_HEADERS)

            for student in students.iterator(chunk_size=1000):
                yield writer.writerow(_extract_student_data(student))

        response = StreamingHttpResponse(
            streaming_content=generate_rows(), content_type="text/csv"
        )
        response["Content-Disposition"] = 'attachment; filename="students.csv"'
        return response

    def _export_pdf(self, students, request) -> HttpResponse:
        students = students.select_related(
            "id_country_of_birth", "id_country_of_departure", "id_country_of_passport"
        )

        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get("page_size", 25)), 100)
        result_page = paginator.paginate_queryset(students, request)

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
        title = Paragraph(f"<b>{_('Student Export Report')}</b>", styles["Title"])
        elements.append(title)
        elements.append(Spacer(1, 12))

        column_indices = [
            STUDENT_EXPORT_HEADERS.index(col)
            for col in STUDENT_EXPORT_HEADERS
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
        filtered_headers = [STUDENT_EXPORT_HEADERS[i] for i in column_indices]
        table_data = [filtered_headers]

        for student in result_page:
            row = _extract_student_data(student)
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


class StudentPhotoView(GenericAPIView):
    permission_classes = [StudentPermission]
    queryset = Student.objects.filter(is_active=True)

    def get(self, request, pk):
        student = self.get_object()
        if not student.photo:
            return FileResponse(status=404)
        return FileResponse(student.photo.open())


class StudentUserAccountView(GenericAPIView):
    permission_classes = [StudentPermission]
    queryset = Student.objects.filter(is_active=True)

    def patch(self, request, pk):
        student = self.get_object()

        if not student.id_user:
            return Response(
                {"message": _("Student does not have a user account.")},
                status=HTTP_404_NOT_FOUND,
            )

        user = student.id_user

        serializer = StudentUserAccountUpdateSerializer(
            data=request.data,
            context={"user": user},
        )
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        email_verification_sent = False
        if email != user.email:
            send_email_change_verification(user, email)
            email_verification_sent = True

        return Response(
            {
                "message": _("User account updated successfully."),
                "email": user.email,
                "email_verification_sent": email_verification_sent,
            }
        )
