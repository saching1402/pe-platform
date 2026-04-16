from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='FundManager',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=200, unique=True)),
                ('strategy', models.CharField(blank=True, max_length=20, null=True)),
                ('pb_score', models.FloatField(blank=True, null=True)),
                ('aum_usd_m', models.FloatField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('year_founded', models.IntegerField(blank=True, null=True)),
                ('segment', models.CharField(blank=True, max_length=100, null=True)),
                ('latest_fund_size_usd_m', models.FloatField(blank=True, null=True)),
                ('avg_irr', models.FloatField(blank=True, null=True)),
                ('avg_tvpi', models.FloatField(blank=True, null=True)),
                ('avg_dpi', models.FloatField(blank=True, null=True)),
                ('avg_rvpi', models.FloatField(blank=True, null=True)),
                ('fund_count', models.IntegerField(default=0)),
                ('total_investments', models.FloatField(blank=True, null=True)),
                ('avg_fund_size', models.FloatField(blank=True, null=True)),
                ('top_quartile_count', models.IntegerField(default=0)),
            ],
            options={'verbose_name': 'Fund Manager', 'verbose_name_plural': 'Fund Managers', 'ordering': ['-avg_irr']},
        ),
        migrations.CreateModel(
            name='WorkflowTask',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=300)),
                ('description', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('open', 'Open'), ('in_progress', 'In Progress'), ('review', 'In Review'), ('done', 'Done')], default='open', max_length=20)),
                ('priority', models.CharField(choices=[('high', 'High'), ('med', 'Medium'), ('low', 'Low')], default='med', max_length=10)),
                ('assignee', models.CharField(blank=True, max_length=100)),
                ('due_date', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('manager', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasks', to='api.fundmanager')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='Fund',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fund_id', models.CharField(db_index=True, max_length=50, unique=True)),
                ('fund_name', models.CharField(max_length=200)),
                ('vintage', models.IntegerField(blank=True, db_index=True, null=True)),
                ('fund_size', models.FloatField(blank=True, null=True)),
                ('fund_type', models.CharField(blank=True, max_length=50, null=True)),
                ('investments', models.FloatField(blank=True, null=True)),
                ('irr', models.FloatField(blank=True, null=True)),
                ('tvpi', models.FloatField(blank=True, null=True)),
                ('rvpi', models.FloatField(blank=True, null=True)),
                ('dpi', models.FloatField(blank=True, null=True)),
                ('fund_quartile', models.CharField(blank=True, max_length=30, null=True)),
                ('irr_benchmark', models.FloatField(blank=True, null=True)),
                ('tvpi_benchmark', models.FloatField(blank=True, null=True)),
                ('dpi_benchmark', models.FloatField(blank=True, null=True)),
                ('as_of_quarter', models.CharField(blank=True, max_length=10, null=True)),
                ('as_of_year', models.IntegerField(blank=True, null=True)),
                ('preferred_geography', models.TextField(blank=True, null=True)),
                ('preferred_industry', models.TextField(blank=True, null=True)),
                ('total_investments', models.FloatField(blank=True, null=True)),
                ('manager', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='funds', to='api.fundmanager')),
            ],
            options={'verbose_name': 'Fund', 'verbose_name_plural': 'Funds', 'ordering': ['manager', 'vintage']},
        ),
        migrations.CreateModel(
            name='TaskComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author', models.CharField(max_length=100)),
                ('body', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='api.workflowtask')),
            ],
            options={'ordering': ['created_at']},
        ),
    ]
