# Generated by Django 5.1.6 on 2025-03-28 13:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('department', '0005_alter_college_code_alter_college_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='department',
            name='college',
        ),
        migrations.CreateModel(
            name='School',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('school_name', models.CharField(default='', max_length=255)),
                ('college', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='school', to='department.college')),
            ],
        ),
        migrations.AddField(
            model_name='department',
            name='school',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='departments', to='department.school'),
        ),
    ]
