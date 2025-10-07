from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, FamilyViewSet, StudentViewSet

router = DefaultRouter()
router.register(r'api/clubs', ClubViewSet)
router.register(r'api/families', FamilyViewSet)
router.register(r'api/students', StudentViewSet)

urlpatterns = [
    path('', include(router.urls))
]