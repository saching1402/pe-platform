from django.db import models


class FundManager(models.Model):
    """Represents a PE fund manager (from Consol View Values sheet)"""
    name = models.CharField(max_length=200, unique=True, db_index=True)
    strategy = models.CharField(max_length=20, null=True, blank=True)  # MM, LMM
    pb_score = models.FloatField(null=True, blank=True)
    aum_usd_m = models.FloatField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    year_founded = models.IntegerField(null=True, blank=True)
    segment = models.CharField(max_length=100, null=True, blank=True)
    latest_fund_size_usd_m = models.FloatField(null=True, blank=True)

    # Computed aggregates (updated by management command)
    avg_irr = models.FloatField(null=True, blank=True)
    avg_tvpi = models.FloatField(null=True, blank=True)
    avg_dpi = models.FloatField(null=True, blank=True)
    avg_rvpi = models.FloatField(null=True, blank=True)
    fund_count = models.IntegerField(default=0)
    total_investments = models.FloatField(null=True, blank=True)
    avg_fund_size = models.FloatField(null=True, blank=True)
    top_quartile_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-avg_irr']
        verbose_name = 'Fund Manager'
        verbose_name_plural = 'Fund Managers'

    def __str__(self):
        return self.name


class Fund(models.Model):
    """Represents an individual fund (from Fund Manager Info sheet)"""
    QUARTILE_CHOICES = [
        ('1 (Top Quartile)', '1 - Top Quartile'),
        ('2 (Upper-Mid Quartile)', '2 - Upper Mid Quartile'),
        ('3 (Lower-Mid Quartile)', '3 - Lower Mid Quartile'),
        ('4 (Bottom Quartile)', '4 - Bottom Quartile'),
    ]
    FUND_TYPE_CHOICES = [
        ('Buyout', 'Buyout'),
        ('Growth/Expansion', 'Growth/Expansion'),
        ('Diversified Private Equity', 'Diversified Private Equity'),
    ]

    fund_id = models.CharField(max_length=50, unique=True, db_index=True)
    manager = models.ForeignKey(FundManager, on_delete=models.CASCADE, related_name='funds')
    fund_name = models.CharField(max_length=200)
    vintage = models.IntegerField(null=True, blank=True, db_index=True)
    fund_size = models.FloatField(null=True, blank=True)
    fund_type = models.CharField(max_length=50, null=True, blank=True, choices=FUND_TYPE_CHOICES)
    investments = models.FloatField(null=True, blank=True)
    irr = models.FloatField(null=True, blank=True)
    tvpi = models.FloatField(null=True, blank=True)
    rvpi = models.FloatField(null=True, blank=True)
    dpi = models.FloatField(null=True, blank=True)
    fund_quartile = models.CharField(max_length=30, null=True, blank=True, choices=QUARTILE_CHOICES)
    irr_benchmark = models.FloatField(null=True, blank=True)
    tvpi_benchmark = models.FloatField(null=True, blank=True)
    dpi_benchmark = models.FloatField(null=True, blank=True)
    as_of_quarter = models.CharField(max_length=10, null=True, blank=True)
    as_of_year = models.IntegerField(null=True, blank=True)
    preferred_geography = models.TextField(null=True, blank=True)
    preferred_industry = models.TextField(null=True, blank=True)
    total_investments = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['manager', 'vintage']
        verbose_name = 'Fund'
        verbose_name_plural = 'Funds'

    def __str__(self):
        return f"{self.manager.name} — {self.fund_name} ({self.vintage})"


class WorkflowTask(models.Model):
    """Workflow / collaboration task for a fund manager"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('review', 'In Review'),
        ('done', 'Done'),
    ]
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('med', 'Medium'),
        ('low', 'Low'),
    ]

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='med')
    assignee = models.CharField(max_length=100, blank=True)
    manager = models.ForeignKey(FundManager, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class TaskComment(models.Model):
    """Comment on a workflow task"""
    task = models.ForeignKey(WorkflowTask, on_delete=models.CASCADE, related_name='comments')
    author = models.CharField(max_length=100)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author} on {self.task}"
