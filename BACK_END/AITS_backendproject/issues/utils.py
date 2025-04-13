from django.core.mail import send_mail
from django.contrib.auth import get_user_model

User = get_user_model()


def send_notification_email(subject, message, recipient_email):
    send_mail(
        subject,
        message,
        'aitswebsite576@gmail.com',  
        [recipient_email],
        fail_silently=False,
    )
    