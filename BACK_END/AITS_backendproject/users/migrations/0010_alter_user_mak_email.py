# Generated by Django 5.1.6 on 2025-04-04 19:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_alter_user_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='mak_email',
            field=models.EmailField(blank=True, max_length=254, null=True, unique=True),
        ),
    ]
