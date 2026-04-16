from django.db.models import Avg, Count, Q, FloatField
from django.db.models.functions import Coalesce
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import FundManager, Fund, WorkflowTask, TaskComment
from .serializers import (
    FundManagerListSerializer, FundManagerDetailSerializer,
    FundSerializer, WorkflowTaskSerializer, TaskCommentSerializer,
    OverviewStatsSerializer, VintageStatsSerializer,
)


# ──────────────────────────────────────────────
# Filters
# ──────────────────────────────────────────────

class FundManagerFilter(django_filters.FilterSet):
    strategy = django_filters.CharFilter(lookup_expr='iexact')
    min_irr = django_filters.NumberFilter(field_name='avg_irr', lookup_expr='gte')
    max_irr = django_filters.NumberFilter(field_name='avg_irr', lookup_expr='lte')
    min_tvpi = django_filters.NumberFilter(field_name='avg_tvpi', lookup_expr='gte')
    min_dpi = django_filters.NumberFilter(field_name='avg_dpi', lookup_expr='gte')
    min_pb_score = django_filters.NumberFilter(field_name='pb_score', lookup_expr='gte')
    year_founded = django_filters.NumberFilter(field_name='year_founded')

    class Meta:
        model = FundManager
        fields = ['strategy', 'min_irr', 'max_irr', 'min_tvpi', 'min_dpi', 'min_pb_score', 'year_founded']


class FundFilter(django_filters.FilterSet):
    vintage = django_filters.NumberFilter()
    vintage_min = django_filters.NumberFilter(field_name='vintage', lookup_expr='gte')
    vintage_max = django_filters.NumberFilter(field_name='vintage', lookup_expr='lte')
    fund_type = django_filters.CharFilter(lookup_expr='iexact')
    quartile = django_filters.CharFilter(field_name='fund_quartile', lookup_expr='icontains')
    min_irr = django_filters.NumberFilter(field_name='irr', lookup_expr='gte')
    max_irr = django_filters.NumberFilter(field_name='irr', lookup_expr='lte')
    min_tvpi = django_filters.NumberFilter(field_name='tvpi', lookup_expr='gte')
    manager_name = django_filters.CharFilter(field_name='manager__name', lookup_expr='icontains')

    class Meta:
        model = Fund
        fields = ['vintage', 'fund_type', 'quartile', 'min_irr', 'max_irr', 'min_tvpi', 'manager_name']


# ──────────────────────────────────────────────
# ViewSets
# ──────────────────────────────────────────────

class FundManagerViewSet(viewsets.ModelViewSet):
    queryset = FundManager.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = FundManagerFilter
    search_fields = ['name', 'description']
    ordering_fields = ['avg_irr', 'avg_tvpi', 'avg_dpi', 'pb_score', 'aum_usd_m', 'fund_count', 'name']
    ordering = ['-avg_irr']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FundManagerDetailSerializer
        return FundManagerListSerializer

    @action(detail=False, methods=['get'])
    def top_performers(self, request):
        """Top N managers by a given metric"""
        metric = request.query_params.get('metric', 'avg_irr')
        n = int(request.query_params.get('n', 15))
        valid = ['avg_irr', 'avg_tvpi', 'avg_dpi', 'pb_score', 'aum_usd_m']
        if metric not in valid:
            return Response({'error': f'metric must be one of {valid}'}, status=400)
        qs = self.get_queryset().filter(**{f'{metric}__isnull': False}).order_by(f'-{metric}')[:n]
        return Response(FundManagerListSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def overview_stats(self, request):
        """Aggregate stats for the overview dashboard, respecting filters"""
        qs = self.filter_queryset(self.get_queryset())
        fund_qs = Fund.objects.filter(manager__in=qs)

        irrs = list(qs.filter(avg_irr__isnull=False).values_list('avg_irr', flat=True))
        tvpis = list(qs.filter(avg_tvpi__isnull=False).values_list('avg_tvpi', flat=True))
        dpis = list(qs.filter(avg_dpi__isnull=False).values_list('avg_dpi', flat=True))
        aums = list(qs.filter(aum_usd_m__isnull=False).values_list('aum_usd_m', flat=True))

        def safe_avg(lst): return sum(lst)/len(lst) if lst else None
        def safe_median(lst):
            if not lst: return None
            s = sorted(lst)
            m = len(s)//2
            return s[m] if len(s)%2 else (s[m-1]+s[m])/2

        vintages = list(fund_qs.filter(vintage__isnull=False).values_list('vintage', flat=True).distinct().order_by('vintage'))

        data = {
            'total_managers': qs.count(),
            'managers_with_irr': qs.filter(avg_irr__isnull=False).count(),
            'total_funds': fund_qs.count(),
            'avg_irr': safe_avg(irrs),
            'median_irr': safe_median(irrs),
            'avg_tvpi': safe_avg(tvpis),
            'avg_dpi': safe_avg(dpis),
            'total_aum_usd_m': sum(aums) if aums else None,
            'vintage_range': [min(vintages), max(vintages)] if vintages else [],
        }
        return Response(data)

    @action(detail=False, methods=['get'])
    def vintage_stats(self, request):
        """IRR, TVPI, DPI aggregated by vintage year"""
        from django.db.models import Avg, Count
        stats = (
            Fund.objects
            .filter(vintage__isnull=False)
            .values('vintage')
            .annotate(
                avg_irr=Avg('irr'),
                avg_tvpi=Avg('tvpi'),
                avg_dpi=Avg('dpi'),
                fund_count=Count('id'),
            )
            .order_by('vintage')
        )
        return Response(list(stats))

    @action(detail=False, methods=['get'])
    def scatter_data(self, request):
        """Return manager-level data points for scatter plots"""
        qs = self.filter_queryset(self.get_queryset())
        data = list(qs.values(
            'name', 'strategy', 'avg_irr', 'avg_tvpi', 'avg_dpi', 'avg_rvpi',
            'pb_score', 'aum_usd_m', 'fund_count',
        ))
        return Response(data)


class FundViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Fund.objects.select_related('manager').all()
    serializer_class = FundSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = FundFilter
    search_fields = ['fund_name', 'manager__name', 'preferred_geography', 'preferred_industry']
    ordering_fields = ['irr', 'tvpi', 'dpi', 'vintage', 'fund_size', 'investments']
    ordering = ['-irr']


class WorkflowTaskViewSet(viewsets.ModelViewSet):
    queryset = WorkflowTask.objects.select_related('manager').prefetch_related('comments').all()
    serializer_class = WorkflowTaskSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'manager']
    search_fields = ['title', 'description', 'assignee']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = TaskCommentSerializer(data={**request.data, 'task': task.id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        valid = [c[0] for c in WorkflowTask.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': f'status must be one of {valid}'}, status=400)
        task.status = new_status
        task.save(update_fields=['status', 'updated_at'])
        return Response(WorkflowTaskSerializer(task).data)


class TaskCommentViewSet(viewsets.ModelViewSet):
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']
