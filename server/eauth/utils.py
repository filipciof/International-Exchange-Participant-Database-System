from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings


def get_frontend_url():
    if settings.DEBUG:
        return "http://localhost:5173"
    return f"https://{settings.PROD_HOST}"


def _make_link(user, mode="activate"):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{get_frontend_url()}/activate/{uid}/{token}?mode={mode}"


def send_activation_email(user):
    send_mail(
        subject="IEPDS - Activate Your Account",
        message=(
            f"Hello,\n\n"
            f"An account has been created for you in the IEPDS system.\n\n"
            f"Please click the link below to set your password and activate your account:\n"
            f"{_make_link(user, 'activate')}\n\n"
            f"If you did not expect this email, you can safely ignore it.\n\n"
            f"IEPDS Team"
        ),
        from_email=None,
        recipient_list=[user.email],
    )


def send_password_reset_email(user):
    send_mail(
        subject="IEPDS - Reset Your Password",
        message=(
            f"Hello,\n\n"
            f"We received a request to reset your password.\n\n"
            f"Please click the link below to set a new password:\n"
            f"{_make_link(user, 'reset')}\n\n"
            f"If you did not request this, you can safely ignore this email.\n\n"
            f"IEPDS Team"
        ),
        from_email=None,
        recipient_list=[user.email],
    )
