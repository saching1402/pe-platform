from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='fund',
            name='strategy',
            field=models.CharField(
                blank=True,
                choices=[
                    ('MM', 'Middle Market'),
                    ('LMM', 'Lower Middle Market'),
                    ('UMM', 'Upper Middle Market'),
                    ('Large Cap', 'Large Cap'),
                    ('Growth', 'Growth'),
                    ('Other', 'Other'),
                ],
                max_length=50,
                null=True,
            ),
        ),
    ]
