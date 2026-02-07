from django.urls import path

from .views import LogoutView, ActivateAccountView, PasswordResetView
from .views import CookieTokenRefreshView, CookieTokenObtainPairView

urlpatterns = [
    path("token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("activate/", ActivateAccountView.as_view(), name="activate_account"),
    path("password-reset/", PasswordResetView.as_view(), name="password_reset"),
]
