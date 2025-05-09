# Generated by Django 5.1.6 on 2025-04-02 14:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("department", "0001_initial"),
        ("users", "0004_remove_collegeregister_college_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="collegeregister",
            name="college",
            field=models.ForeignKey(
                default="1",
                on_delete=django.db.models.deletion.CASCADE,
                to="department.college",
            ),
        ),
        migrations.AddField(
            model_name="lecturer",
            name="college",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="department.college",
            ),
        ),
        migrations.AddField(
            model_name="lecturer",
            name="department",
            field=models.ForeignKey(
                default="",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="department.department",
            ),
        ),
        migrations.AddField(
            model_name="student",
            name="college",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="department.college",
            ),
        ),
        migrations.AlterField(
            model_name="user",
            name="college",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="department.college",
            ),
        ),
    ]
