# Generated by Django 5.1.6 on 2025-03-28 11:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0009_user_notification_email_alter_collegeregister_user_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="notification_email",
        ),
    ]
