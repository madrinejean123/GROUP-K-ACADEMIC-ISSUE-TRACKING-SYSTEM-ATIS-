# Generated by Django 5.1.5 on 2025-02-26 13:24

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
                ('email', models.EmailField(max_length=225, unique=True)),
                ('category', models.CharField(max_length=50)),
                ('description', models.TextField()),
                ('attachment', models.ImageField(blank=True, null=True, upload_to='insert tab/')),
                ('assigned_lecturer', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
