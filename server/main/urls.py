from django.urls import path
from .views import not_found_view, ClubView, FamilyView, StudentView
from config.settings import DEBUG

not_found_url = path("", not_found_view, name="root-not-found")

urlpatterns = [
    path("clubs/", ClubView.as_view()),
    path("families/", FamilyView.as_view()),
    path("students/", StudentView.as_view()),
]

if DEBUG is False:
    urlpatterns.insert(0, not_found_url)
