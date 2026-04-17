from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FundManagerViewSet, FundViewSet, WorkflowTaskViewSet, TaskCommentViewSet,
    login_view, logout_view, me_view, export_funds_excel,
)

router = DefaultRouter()
router.register(r'managers', FundManagerViewSet, basename='manager')
router.register(r'funds', FundViewSet, basename='fund')
router.register(r'tasks', WorkflowTaskViewSet, basename='task')
router.register(r'comments', TaskCommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
    # Auth endpoints — no session required
    path('auth/login/', login_view),
    path('auth/logout/', logout_view),
    path('auth/me/', me_view),
    # Export endpoints
    path('funds/export/excel/', export_funds_excel, name='export-funds-excel'),
]
