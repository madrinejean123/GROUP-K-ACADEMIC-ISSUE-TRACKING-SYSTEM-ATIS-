# Generated by Django 5.1.5 on 2025-03-30 12:46

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Issues',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('resolved', 'Resolved'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('title', models.CharField(choices=[('registration_issue', 'REGISTRATION ISSUE'), ('marks_correction', 'MARKS CORRECTION')], default='marks_correction', max_length=255)),
                ('description', models.TextField()),
                ('attachment', models.ImageField(blank=True, null=True, upload_to='issue_attachments/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
