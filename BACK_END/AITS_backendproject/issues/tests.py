from django.test import TestCase
from django.core import mail
from .utils import send_notification_email

class EmailTests(TestCase):
    def test_send_email(self):
        success = send_notification_email(
            subject="Unit Test Email",
            message="This is a test email sent from unit test.",
            recipient_email="youremail@example.com"
        )
        self.assertTrue(success)


