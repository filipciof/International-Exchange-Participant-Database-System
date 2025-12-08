from django.urls import path
from .views import (
    not_found_view,
    ClubView,
    FamilyView,
    StudentView,
    CountryView,
    DistrictView,
    StudentPhotoView,
    ExchangeView,
)
from config.settings import DEBUG

not_found_url = path("", not_found_view, name="root-not-found")

urlpatterns = [
    path("countries/", CountryView.as_view()),
    path("districts/", DistrictView.as_view()),
    path("clubs/", ClubView.as_view()),
    path("families/", FamilyView.as_view()),
    path("students/", StudentView.as_view()),
    path("students/<int:pk>/", StudentView.as_view()),
    path("students/photos/", StudentPhotoView.as_view()),
    path("exchanges/", ExchangeView.as_view()),
]

if DEBUG is False:
    urlpatterns.insert(0, not_found_url)
