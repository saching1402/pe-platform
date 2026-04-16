"""
Management command to seed the database from the Excel file.
Usage:
    python manage.py seed_data --file path/to/file.xlsx
    python manage.py seed_data  # uses data/fund_data.xlsx by default
"""
import os
import math
import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from api.models import FundManager, Fund, WorkflowTask, TaskComment


def safe_float(v):
    try:
        f = float(v)
        return None if math.isnan(f) else f
    except (TypeError, ValueError):
        return None


def safe_int(v):
    try:
        f = float(v)
        return None if math.isnan(f) else int(f)
    except (TypeError, ValueError):
        return None


class Command(BaseCommand):
    help = 'Seed database from PE fund manager Excel file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            default=os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data', 'fund_data.xlsx'),
            help='Path to the Excel file',
        )
        parser.add_argument('--clear', action='store_true', help='Clear existing data before seeding')

    def handle(self, *args, **options):
        filepath = os.path.abspath(options['file'])
        if not os.path.exists(filepath):
            raise CommandError(f'File not found: {filepath}')

        self.stdout.write(f'Loading data from: {filepath}')

        xl = pd.ExcelFile(filepath)
        df_info = pd.read_excel(xl, sheet_name='Fund Manager Info', header=0)
        df_consol = pd.read_excel(xl, sheet_name='Consol View Values', header=0)

        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Fund.objects.all().delete()
            FundManager.objects.all().delete()

        with transaction.atomic():
            self._seed_managers(df_consol, df_info)
            self._seed_funds(df_info)
            self._update_manager_aggregates()
            self._seed_sample_tasks()

        self.stdout.write(self.style.SUCCESS(
            f'Seeding complete. '
            f'{FundManager.objects.count()} managers, '
            f'{Fund.objects.count()} funds, '
            f'{WorkflowTask.objects.count()} tasks.'
        ))

    def _seed_managers(self, df_consol, df_info):
        self.stdout.write('Seeding fund managers...')
        created = 0
        for _, row in df_consol.iterrows():
            name = str(row.get('Masked Investor Name', '')).strip()
            if not name or name == 'nan':
                continue

            pb_col = [c for c in df_consol.columns if 'Score' in str(c)]
            pb_score = safe_float(row[pb_col[0]]) if pb_col else None

            FundManager.objects.update_or_create(
                name=name,
                defaults=dict(
                    strategy=str(row.get('Strategy', '') or '').strip() or None,
                    pb_score=pb_score,
                    aum_usd_m=safe_float(row.get('AUM (USD M)')),
                    description=str(row.get('Description', '') or '').strip() or None,
                    year_founded=safe_int(row.get('Year Found')),
                    segment=str(row.get('Segment', '') or '').strip() or None,
                    latest_fund_size_usd_m=safe_float(row.get('Latest Fund Size (USD M)')),
                )
            )
            created += 1

        # Ensure all managers from fund sheet exist
        for name in df_info['Masked Investor Name'].dropna().unique():
            name = str(name).strip()
            FundManager.objects.get_or_create(name=name)

        self.stdout.write(f'  {created} managers processed.')

    def _seed_funds(self, df_info):
        self.stdout.write('Seeding funds...')
        created = updated = 0
        for _, row in df_info.iterrows():
            fund_id = str(row.get('Fund ID', '') or '').strip()
            mgr_name = str(row.get('Masked Investor Name', '') or '').strip()
            if not fund_id or not mgr_name:
                continue

            try:
                manager = FundManager.objects.get(name=mgr_name)
            except FundManager.DoesNotExist:
                self.stderr.write(f'  Manager not found: {mgr_name}')
                continue

            obj, was_created = Fund.objects.update_or_create(
                fund_id=fund_id,
                defaults=dict(
                    manager=manager,
                    fund_name=str(row.get('Masked Fund Name', '') or '').strip(),
                    vintage=safe_int(row.get('Vintage')),
                    fund_size=safe_float(row.get('Fund Size')),
                    fund_type=str(row.get('Fund Type', '') or '').strip() or None,
                    investments=safe_float(row.get('Investments')),
                    irr=safe_float(row.get('IRR')),
                    tvpi=safe_float(row.get('TVPI')),
                    rvpi=safe_float(row.get('RVPI')),
                    dpi=safe_float(row.get('DPI')),
                    fund_quartile=str(row.get('Fund Quartile', '') or '').strip() or None,
                    irr_benchmark=safe_float(row.get('IRR Benchmark*')),
                    tvpi_benchmark=safe_float(row.get('TVPI Benchmark*')),
                    dpi_benchmark=safe_float(row.get('DPI Benchmark*')),
                    as_of_quarter=str(row.get('As of Quarter', '') or '').strip() or None,
                    as_of_year=safe_int(row.get('As of Year')),
                    preferred_geography=str(row.get('Preferred Geography', '') or '').strip() or None,
                    preferred_industry=str(row.get('Preferred Industry', '') or '').strip() or None,
                    total_investments=safe_float(row.get('Total Investments')),
                )
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(f'  {created} created, {updated} updated.')

    def _update_manager_aggregates(self):
        """Recompute avg_irr, avg_tvpi etc. from funds."""
        self.stdout.write('Computing manager aggregates...')
        for manager in FundManager.objects.all():
            funds = manager.funds.all()
            irrs = [f.irr for f in funds if f.irr is not None]
            tvpis = [f.tvpi for f in funds if f.tvpi is not None]
            dpis = [f.dpi for f in funds if f.dpi is not None]
            rvpis = [f.rvpi for f in funds if f.rvpi is not None]
            invs = [f.investments for f in funds if f.investments is not None]
            sizes = [f.fund_size for f in funds if f.fund_size is not None]

            manager.avg_irr = sum(irrs)/len(irrs) if irrs else None
            manager.avg_tvpi = sum(tvpis)/len(tvpis) if tvpis else None
            manager.avg_dpi = sum(dpis)/len(dpis) if dpis else None
            manager.avg_rvpi = sum(rvpis)/len(rvpis) if rvpis else None
            manager.fund_count = funds.count()
            manager.total_investments = sum(invs) if invs else None
            manager.avg_fund_size = sum(sizes)/len(sizes) if sizes else None
            manager.top_quartile_count = funds.filter(fund_quartile__icontains='1 (Top').count()
            manager.save()

        self.stdout.write('  Aggregates updated.')

    def _seed_sample_tasks(self):
        if WorkflowTask.objects.exists():
            return
        self.stdout.write('Seeding sample workflow tasks...')
        tasks_data = [
            dict(title='Due Diligence — ABC 9', status='open', priority='high', assignee='Sarah K.',
                 description='Review full track record for ABC 9 (LMM strategy). Focus on 2015–2019 vintage funds.'),
            dict(title='Review ABC 26 Track Record', status='open', priority='med', assignee='Mark T.',
                 description='ABC 26 shows the highest avg IRR. Validate data quality.'),
            dict(title='Scoring ABC 32 & ABC 35', status='in_progress', priority='high', assignee='Lisa M.',
                 description='Complete internal scoring matrix for ABC 32 and ABC 35.'),
            dict(title='LP Reference Calls — ABC 82', status='in_progress', priority='med', assignee='James P.',
                 description='Schedule reference calls with 3 LPs. Focus on team stability.'),
            dict(title='IC Memo — ABC 101', status='review', priority='low', assignee='Anna C.',
                 description='Draft IC memo for ABC 101. Include track record summary.'),
            dict(title='Initial Screen — All Managers', status='done', priority='low', assignee='Team',
                 description='Completed initial quantitative screen of all 103 managers.'),
        ]
        for td in tasks_data:
            mgr_name = td.pop('title', '').split('—')[-1].strip() if '—' in td.get('title', '') else None
            mgr = None
            if mgr_name:
                try:
                    mgr = FundManager.objects.get(name=mgr_name)
                except FundManager.DoesNotExist:
                    pass
            task = WorkflowTask.objects.create(manager=mgr, **td)

        # Sample comments
        first_task = WorkflowTask.objects.first()
        if first_task:
            TaskComment.objects.create(task=first_task, author='Sarah K.',
                body='Started the track record review. ABC 9 shows consistent top-quartile performance.')
            TaskComment.objects.create(task=first_task, author='Mark T.',
                body='Confirmed LP references from 3 LPs — all positive.')
