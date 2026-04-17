from rest_framework import serializers
from .models import FundManager, Fund, WorkflowTask, TaskComment


class FundSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.name', read_only=True)

    class Meta:
        model = Fund
        fields = [
            'id', 'fund_id', 'manager', 'manager_name', 'fund_name',
            'vintage', 'fund_size', 'fund_type', 'strategy', 'investments',
            'irr', 'tvpi', 'rvpi', 'dpi', 'fund_quartile',
            'irr_benchmark', 'tvpi_benchmark', 'dpi_benchmark',
            'as_of_quarter', 'as_of_year',
            'preferred_geography', 'preferred_industry', 'total_investments',
        ]


class FundManagerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    class Meta:
        model = FundManager
        fields = [
            'id', 'name', 'strategy', 'pb_score', 'aum_usd_m', 'year_founded',
            'avg_irr', 'avg_tvpi', 'avg_dpi', 'avg_rvpi',
            'fund_count', 'total_investments', 'avg_fund_size', 'top_quartile_count',
            'latest_fund_size_usd_m',
        ]


class FundManagerDetailSerializer(serializers.ModelSerializer):
    """Full serializer with nested funds for detail view"""
    funds = FundSerializer(many=True, read_only=True)

    class Meta:
        model = FundManager
        fields = [
            'id', 'name', 'strategy', 'pb_score', 'aum_usd_m',
            'description', 'year_founded', 'segment', 'latest_fund_size_usd_m',
            'avg_irr', 'avg_tvpi', 'avg_dpi', 'avg_rvpi',
            'fund_count', 'total_investments', 'avg_fund_size', 'top_quartile_count',
            'funds',
        ]


class TaskCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'author', 'body', 'created_at']
        read_only_fields = ['created_at']


class WorkflowTaskSerializer(serializers.ModelSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)
    manager_name = serializers.CharField(source='manager.name', read_only=True)

    class Meta:
        model = WorkflowTask
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'assignee', 'manager', 'manager_name', 'due_date',
            'created_at', 'updated_at', 'comments',
        ]
        read_only_fields = ['created_at', 'updated_at']


class OverviewStatsSerializer(serializers.Serializer):
    total_managers = serializers.IntegerField()
    managers_with_irr = serializers.IntegerField()
    total_funds = serializers.IntegerField()
    avg_irr = serializers.FloatField(allow_null=True)
    median_irr = serializers.FloatField(allow_null=True)
    avg_tvpi = serializers.FloatField(allow_null=True)
    avg_dpi = serializers.FloatField(allow_null=True)
    total_aum_usd_m = serializers.FloatField(allow_null=True)
    vintage_range = serializers.ListField(child=serializers.IntegerField())


class VintageStatsSerializer(serializers.Serializer):
    vintage = serializers.IntegerField()
    avg_irr = serializers.FloatField(allow_null=True)
    avg_tvpi = serializers.FloatField(allow_null=True)
    avg_dpi = serializers.FloatField(allow_null=True)
    fund_count = serializers.IntegerField()
