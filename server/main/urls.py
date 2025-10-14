from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, FamilyViewSet, StudentViewSet, not_found_view
from config.settings import DEBUG

router = DefaultRouter()
router.register(r"clubs", ClubViewSet)
router.register(r"families", FamilyViewSet)
router.register(r"students", StudentViewSet)

not_found_url = path("", not_found_view, name="root-not-found")

urlpatterns = [path("", include(router.urls))]

if DEBUG is False:
    urlpatterns.insert(0, not_found_url)
