# Generated by Django 5.1.7 on 2025-04-09 05:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_merge_20250408_0509'),
    ]

    operations = [
        migrations.AlterField(
            model_name='collegeregister',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='registrar', to='users.user'),
        ),
        migrations.AlterField(
            model_name='lecturer',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='lecturers', to='users.user'),
        ),
        migrations.AlterField(
            model_name='student',
            name='user',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='student', to='users.user'),
        ),
    ]
