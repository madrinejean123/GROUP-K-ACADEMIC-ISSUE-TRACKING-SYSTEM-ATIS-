# Generated by Django 5.1.5 on 2025-02-26 19:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('issues', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='issues',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('resolved', 'Resolved'), ('rejected', 'Rejected')], default='pending', max_length=20),
        ),
    ]
