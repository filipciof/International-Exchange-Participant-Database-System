from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK,
    HTTP_403_FORBIDDEN,
)
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken
from eauth.serializers import (
    TokenObtainPairSerializer,
    ActivateAccountSerializer,
    VerifyEmailChangeSerializer,
)
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed
from django.core.signing import BadSignature, SignatureExpired
from eauth.utils import (
    send_password_reset_email,
    send_activation_success_email,
    send_password_reset_success_email,
    verify_email_change_token,
)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer


class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None

    def validate(self, attrs):
        attrs["refresh"] = self.context["request"].COOKIES.get("refresh_token")
        if attrs["refresh"]:
            return super().validate(attrs)
        else:
            raise InvalidToken("No valid token found in cookie 'refresh_token'")


class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("refresh"):
            cookie_max_age = 3600 * 24  # a day
            response.set_cookie(
                "refresh_token",
                response.data["refresh"],
                max_age=cookie_max_age,
                httponly=True,
            )
            del response.data["refresh"]
        access_token = response.data.get("access")
        if access_token:
            try:
                token_data = AccessToken(access_token)
                user_id = token_data["user_id"]
                user = get_user_model().objects.get(id=user_id)
                response.data["user"] = {
                    "email": user.email,
                    "groups": user.groups.values_list("name", flat=True),
                }
            except (AccessToken.Error, get_user_model().DoesNotExist):
                response.data["user"] = {}
        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("refresh"):
            cookie_max_age = 3600 * 24  # a day
            response.set_cookie(
                "refresh_token",
                response.data["refresh"],
                max_age=cookie_max_age,
                httponly=True,
            )
            del response.data["refresh"]
        return super().finalize_response(request, response, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except AuthenticationFailed as e:
            return Response({"detail": str(e)}, status=HTTP_403_FORBIDDEN)

    serializer_class = CookieTokenRefreshSerializer


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"message": "Successfully logged out!"}, status=HTTP_200_OK)
        response.delete_cookie("refresh_token")
        return response


class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    def _validate_link(self, uid, token):
        try:
            id_user = urlsafe_base64_decode(uid).decode()
            user = get_user_model().objects.get(pk=id_user)
        except (ValueError, TypeError, get_user_model().DoesNotExist):
            return None

        if not default_token_generator.check_token(user, token):
            return None

        return user

    def get(self, request):
        uid = request.query_params.get("uid")
        token = request.query_params.get("token")

        if not uid or not token:
            return Response(
                {"detail": "Missing uid or token."},
                status=HTTP_400_BAD_REQUEST,
            )

        user = self._validate_link(uid, token)
        if not user:
            return Response(
                {"detail": "Activation link is invalid or has expired."},
                status=HTTP_400_BAD_REQUEST,
            )

        return Response({"detail": "Valid activation link."}, status=HTTP_200_OK)

    def post(self, request):
        serializer = ActivateAccountSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        password = serializer.validated_data["password"]

        user = self._validate_link(uid, token)
        if not user:
            return Response(
                {"detail": "Activation link is invalid or has expired."},
                status=HTTP_400_BAD_REQUEST,
            )

        is_reset = user.has_usable_password()

        user.set_password(password)
        user.save(update_fields=["password"])

        if is_reset:
            send_password_reset_success_email(user)
            return Response(
                {"detail": "Password reset successfully."}, status=HTTP_200_OK
            )

        send_activation_success_email(user)
        return Response(
            {"detail": "Account activated successfully."}, status=HTTP_200_OK
        )


class VerifyEmailChangeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        try:
            data = verify_email_change_token(serializer.validated_data["token"])
        except (BadSignature, SignatureExpired):
            return Response(
                {"detail": "Verification link is invalid or has expired."},
                status=HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()
        try:
            user = User.objects.get(pk=data["id_user"])
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=HTTP_400_BAD_REQUEST,
            )

        new_email = data["new_email"]
        if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
            return Response(
                {"detail": "This email is already in use."},
                status=HTTP_400_BAD_REQUEST,
            )

        user.email = new_email
        user.save(update_fields=["email"])

        return Response(
            {"detail": "Email changed successfully."}, status=HTTP_200_OK
        )


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"detail": "Email is required."}, status=HTTP_400_BAD_REQUEST
            )

        try:
            user = get_user_model().objects.get(email=email)
            send_password_reset_email(user)
        except get_user_model().DoesNotExist:
            pass

        return Response(
            {"detail": "Password reset email sent."}, status=HTTP_200_OK
        )
