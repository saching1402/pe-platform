from django.contrib import admin
from .models import FundManager, Fund, WorkflowTask, TaskComment


@admin.register(FundManager)
class FundManagerAdmin(admin.ModelAdmin):
    list_display = ['name', 'strategy', 'avg_irr', 'avg_tvpi', 'avg_dpi', 'pb_score', 'aum_usd_m', 'fund_count']
    list_filter = ['strategy']
    search_fields = ['name', 'description']
    ordering = ['-avg_irr']


@admin.register(Fund)
class FundAdmin(admin.ModelAdmin):
    list_display = ['fund_name', 'manager', 'vintage', 'fund_size', 'irr', 'tvpi', 'dpi', 'fund_quartile']
    list_filter = ['vintage', 'fund_type', 'fund_quartile']
    search_fields = ['fund_name', 'manager__name']
    ordering = ['-irr']


@admin.register(WorkflowTask)
class WorkflowTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'priority', 'assignee', 'manager', 'due_date']
    list_filter = ['status', 'priority']
    search_fields = ['title', 'assignee']


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'created_at']
