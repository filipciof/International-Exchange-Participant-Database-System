from django.http import Http404
from django.urls import path
from config.settings import DEBUG
from main.views import (
    CountryView, DistrictView, ClubListView, ClubDetailView,
    FamilyView, FamilyMemberView,
    StudentView, StudentUserAccountView, StudentPhotoView,
    ExchangeView, ExchangeFamilyView, ExchangeTypeView,
    DocumentView,
    StaffView, StaffUserAccountView, StaffPhotoView,
    ContactView, ContactPhotoView,
)


def not_found_view(request):
    raise Http404("Not Found")


not_found_url = path("", not_found_view, name="root-not-found")

urlpatterns = [
    path("countries/", CountryView.as_view()),
    path("districts/", DistrictView.as_view()),
    path("clubs/", ClubListView.as_view()),
    path("clubs/<int:pk>/", ClubDetailView.as_view()),
    path("families/", FamilyView.as_view()),
    path("families/<int:pk>/", FamilyView.as_view()),
    path("family-members/", FamilyMemberView.as_view()),
    path("family-members/<int:pk>/", FamilyMemberView.as_view()),
    path("students/", StudentView.as_view()),
    path("students/<int:pk>/", StudentView.as_view()),
    path("students/<int:pk>/user-account/", StudentUserAccountView.as_view()),
    path("students/photos/", StudentPhotoView.as_view()),
    path("exchanges/", ExchangeView.as_view()),
    path("exchanges/<int:pk>/", ExchangeView.as_view()),
    path("exchange-families/", ExchangeFamilyView.as_view()),
    path("exchange-families/<int:pk>/", ExchangeFamilyView.as_view()),
    path("exchangeTypes/", ExchangeTypeView.as_view()),
    path("documents/", DocumentView.as_view()),
    path("documents/<int:pk>/", DocumentView.as_view()),
    path("staff/", StaffView.as_view()),
    path("staff/<int:pk>/", StaffView.as_view()),
    path("staff/<int:pk>/user-account/", StaffUserAccountView.as_view()),
    path("staff/photos/", StaffPhotoView.as_view()),
    path("contacts/", ContactView.as_view()),
    path("contacts/<int:pk>/", ContactView.as_view()),
    path("contacts/photos/", ContactPhotoView.as_view()),
]

if DEBUG is False:
    urlpatterns.insert(0, not_found_url)
