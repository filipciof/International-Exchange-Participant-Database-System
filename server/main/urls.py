from django.urls import path
from .views import (
    not_found_view,
    ClubView,
    FamilyView,
    FamilyMemberView,
    CountryView,
    DistrictView,
    ExchangeTypeView,
    ExchangeView,
    StaffView,
    StaffPhotoView,
)
from .student_views import StudentView, StudentPhotoView
from config.settings import DEBUG

not_found_url = path("", not_found_view, name="root-not-found")

urlpatterns = [
    path("countries/", CountryView.as_view()),
    path("districts/", DistrictView.as_view()),
    path("clubs/", ClubView.as_view()),
    path("clubs/<int:pk>/", ClubView.as_view()),
    path("families/", FamilyView.as_view()),
    path("families/<int:pk>/", FamilyView.as_view()),
    path("family-members/", FamilyMemberView.as_view()),
    path("family-members/<int:pk>/", FamilyMemberView.as_view()),
    path("students/", StudentView.as_view()),
    path("students/<int:pk>/", StudentView.as_view()),
    path("students/photos/", StudentPhotoView.as_view()),
    path("exchanges/", ExchangeView.as_view()),
    path("exchanges/<int:pk>/", ExchangeView.as_view()),
    path("exchangeTypes/", ExchangeTypeView.as_view()),
    path("staff/", StaffView.as_view()),
    path("staff/<int:pk>/", StaffView.as_view()),
    path("staff/photos/", StaffPhotoView.as_view()),
]

if DEBUG is False:
    urlpatterns.insert(0, not_found_url)
