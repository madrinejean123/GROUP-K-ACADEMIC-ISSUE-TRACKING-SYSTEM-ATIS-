import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('department', '0001_initial'),
        ('users', '0006_merge_20250404_1116'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lecturer',
            name='college',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to='department.college',
                null=False,  
            ),
        ),
    ]
