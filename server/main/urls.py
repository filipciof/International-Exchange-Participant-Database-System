from django.http import Http404
from django.urls import path
from config.settings import DEBUG
from main.views import (
    CountryView, DistrictListView, DistrictDetailView,
    ClubListView, ClubDetailView,
    FamilyListView, FamilyDetailView,
    FamilyMemberListView, FamilyMemberDetailView,
    StudentListView, StudentDetailView, StudentMeView,
    StudentExportView, StudentPhotoView, StudentUserAccountView,
    YearListView, YearDetailView,
    ExchangeTypeView,
    ExchangeListView, ExchangeDetailView,
    ExchangeFamilyListView, ExchangeFamilyDetailView,
    DocumentListView, DocumentDetailView, DocumentFileView,
    StaffListView, StaffDetailView, StaffMeView,
    StaffPhotoView, StaffUserAccountView,
    ContactListView, ContactDetailView, ContactPhotoView,
    CounsellorListView, CounsellorDetailView, CounsellorPhotoView,
)


def not_found_view(request):
    raise Http404("Not Found")


not_found_url = path("", not_found_view, name="root-not-found")

urlpatterns = [
    path("countries/", CountryView.as_view()),
    path("districts/", DistrictListView.as_view()),
    path("districts/<int:pk>/", DistrictDetailView.as_view()),
    path("clubs/", ClubListView.as_view()),
    path("clubs/<int:pk>/", ClubDetailView.as_view()),
    path("families/", FamilyListView.as_view()),
    path("families/<int:pk>/", FamilyDetailView.as_view()),
    path("family-members/", FamilyMemberListView.as_view()),
    path("family-members/<int:pk>/", FamilyMemberDetailView.as_view()),
    path("students/", StudentListView.as_view()),
    path("students/me/", StudentMeView.as_view()),
    path("students/export/", StudentExportView.as_view()),
    path("students/<int:pk>/photo/", StudentPhotoView.as_view()),
    path("students/<int:pk>/user-account/", StudentUserAccountView.as_view()),
    path("students/<int:pk>/", StudentDetailView.as_view()),
    path("years/", YearListView.as_view()),
    path("years/<int:pk>/", YearDetailView.as_view()),
    path("exchanges/", ExchangeListView.as_view()),
    path("exchanges/<int:pk>/", ExchangeDetailView.as_view()),
    path("exchange-families/", ExchangeFamilyListView.as_view()),
    path("exchange-families/<int:pk>/", ExchangeFamilyDetailView.as_view()),
    path("exchangeTypes/", ExchangeTypeView.as_view()),
    path("documents/", DocumentListView.as_view()),
    path("documents/<int:pk>/file/", DocumentFileView.as_view()),
    path("documents/<int:pk>/", DocumentDetailView.as_view()),
    path("staff/", StaffListView.as_view()),
    path("staff/me/", StaffMeView.as_view()),
    path("staff/<int:pk>/photo/", StaffPhotoView.as_view()),
    path("staff/<int:pk>/user-account/", StaffUserAccountView.as_view()),
    path("staff/<int:pk>/", StaffDetailView.as_view()),
    path("contacts/", ContactListView.as_view()),
    path("contacts/<int:pk>/", ContactDetailView.as_view()),
    path("contacts/<int:pk>/photo/", ContactPhotoView.as_view()),
    path("counsellors/", CounsellorListView.as_view()),
    path("counsellors/<int:pk>/", CounsellorDetailView.as_view()),
    path("counsellors/<int:pk>/photo/", CounsellorPhotoView.as_view()),
]

if DEBUG is False:
    urlpatterns.insert(0, not_found_url)
