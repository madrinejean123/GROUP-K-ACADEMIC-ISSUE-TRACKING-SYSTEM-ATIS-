from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


def send_notification_email(subject, message, recipient_email):
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,  
            [recipient_email],
            fail_silently=False,
        )
        logger.info(f'Email sent to {recipient_email}')
        return True
    except Exception as e:
        logger.error(f'Error sending email to {recipient_email}:{e}')
        return False
        
