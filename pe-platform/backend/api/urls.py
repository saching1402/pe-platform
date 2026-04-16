from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FundManagerViewSet, FundViewSet, WorkflowTaskViewSet, TaskCommentViewSet

router = DefaultRouter()
router.register(r'managers', FundManagerViewSet, basename='manager')
router.register(r'funds', FundViewSet, basename='fund')
router.register(r'tasks', WorkflowTaskViewSet, basename='task')
router.register(r'comments', TaskCommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]
