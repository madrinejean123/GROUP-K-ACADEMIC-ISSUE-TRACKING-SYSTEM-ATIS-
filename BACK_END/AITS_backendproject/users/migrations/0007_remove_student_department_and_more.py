# Generated by Django 5.1.7 on 2025-03-20 08:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_student_student_no_user_full_name_user_mak_email_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='student',
            name='department',
        ),
        migrations.RemoveField(
            model_name='student',
            name='year_of_study',
        ),
    ]
