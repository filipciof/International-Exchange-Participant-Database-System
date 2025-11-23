from django.urls import path
from .views import ContactPhotoView, ContactView


urlpatterns = [
    path("", ContactView.as_view()),
    path("<int:pk>/", ContactView.as_view()),
    path("photos/", ContactPhotoView.as_view()),
]
