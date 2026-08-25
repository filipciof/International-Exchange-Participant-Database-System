from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.translation import gettext as _
from django.core.mail import send_mail
from django.conf import settings

EMAIL_CHANGE_SALT = "email-change"
EMAIL_CHANGE_MAX_AGE = 259200  # 3 days


def get_frontend_url():
    if settings.DEBUG:
        return "http://localhost:5173"
    return f"https://{settings.FRONTEND_URL}"


def _make_link(user, mode="activate"):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{get_frontend_url()}/activate/{uid}/{token}?mode={mode}"


def send_activation_email(user):
    send_mail(
        subject=_("RYE District 2231 - Activate Your Account"),
        message=_(
            "Hello,\n\n"
            "An account has been created for you in the Rotary District 2231 Youth Exchange Management Service.\n\n"
            "Please click the link below to set your password and activate your account:\n"
            "%(link)s\n\n"
            "If you did not expect this email, you can safely ignore it."
        )
        % {"link": _make_link(user, "activate")},
        from_email=None,
        recipient_list=[user.email],
    )


def send_password_reset_email(user):
    send_mail(
        subject=_("RYE District 2231 - Reset Your Password"),
        message=_(
            "Hello,\n\n"
            "We received a request to reset your password.\n\n"
            "Please click the link below to set a new password:\n"
            "%(link)s\n\n"
            "If you did not request this, you can safely ignore this email."
        )
        % {"link": _make_link(user, "reset")},
        from_email=None,
        recipient_list=[user.email],
    )


def send_activation_success_email(user):
    send_mail(
        subject=_("RYE District 2231 - Account Activated"),
        message=_(
            "Hello,\n\n"
            "Your account has been successfully activated.\n\n"
            "You can now sign in at:\n"
            "%(link)s"
        )
        % {"link": f"{get_frontend_url()}/sign-in"},
        from_email=None,
        recipient_list=[user.email],
    )


def send_password_reset_success_email(user):
    send_mail(
        subject=_("RYE District 2231 - Password Changed"),
        message=_(
            "Hello,\n\n"
            "Your password has been successfully changed.\n\n"
            "If you did not make this change, please contact us immediately."
        ),
        from_email=None,
        recipient_list=[user.email],
    )


def make_email_change_token(id_user, new_email):
    return signing.dumps(
        {"id_user": id_user, "new_email": new_email},
        salt=EMAIL_CHANGE_SALT,
    )


def verify_email_change_token(token):
    return signing.loads(
        token,
        salt=EMAIL_CHANGE_SALT,
        max_age=EMAIL_CHANGE_MAX_AGE,
    )


def send_email_change_verification(user, new_email):
    token = make_email_change_token(user.pk, new_email)
    link = f"{get_frontend_url()}/verify-email/{token}"
    send_mail(
        subject=_("RYE District 2231 - Verify Email Change"),
        message=_(
            "Hello,\n\n"
            "A request was made to change your account email to this address.\n\n"
            "Please click the link below to confirm the change:\n"
            "%(link)s\n\n"
            "If you did not expect this email, you can safely ignore it."
        )
        % {"link": link},
        from_email=None,
        recipient_list=[new_email],
    )
