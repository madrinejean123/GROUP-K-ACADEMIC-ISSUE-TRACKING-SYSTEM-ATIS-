from django.test import TestCase
from django.core import mail
from .utils import send_notification_email

class EmailTest(TestCase):
    def test_send_notification_email(self):
        send_notification_email('Test Subject', 'Test Message', 'jonathantugume569@gmail.com')
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Test Subject')



