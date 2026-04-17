"""
Management command to populate Fund.strategy from parent FundManager.strategy.
Safe to run multiple times — only updates funds with null strategy.
"""
from django.core.management.base import BaseCommand
from api.models import Fund

STRATEGY_MAP = {
    'MM':        'MM',
    'LMM':       'LMM',
    'UMM':       'UMM',
    'Large Cap': 'Large Cap',
    'Growth':    'Growth',
    'Other':     'Other',
}

def map_strategy(raw):
    if not raw:
        return None
    raw = str(raw).strip()
    # Direct match first
    if raw in STRATEGY_MAP:
        return STRATEGY_MAP[raw]
    # Case-insensitive match
    for key, val in STRATEGY_MAP.items():
        if key.lower() == raw.lower():
            return val
    # Partial matches for common variants
    raw_upper = raw.upper()
    if 'LOWER' in raw_upper or 'LMM' in raw_upper:
        return 'LMM'
    if 'UPPER' in raw_upper or 'UMM' in raw_upper:
        return 'UMM'
    if 'LARGE' in raw_upper:
        return 'Large Cap'
    if 'GROWTH' in raw_upper:
        return 'Growth'
    if 'MIDDLE' in raw_upper or raw_upper == 'MM':
        return 'MM'
    return 'Other'


class Command(BaseCommand):
    help = 'Populate Fund.strategy from parent FundManager.strategy (only fills null values)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Overwrite existing strategy values too (default: only fill nulls)',
        )

    def handle(self, *args, **options):
        overwrite = options['overwrite']
        qs = Fund.objects.select_related('manager')
        if not overwrite:
            qs = qs.filter(strategy__isnull=True)

        updated = skipped = 0
        for fund in qs:
            mgr_strategy = fund.manager.strategy if fund.manager else None
            mapped = map_strategy(mgr_strategy)
            if mapped:
                fund.strategy = mapped
                fund.save(update_fields=['strategy'])
                updated += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done: {updated} funds updated, {skipped} skipped (no manager strategy).'
        ))
