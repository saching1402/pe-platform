from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Serve React frontend on all other routes (production)
if not settings.DEBUG:
    frontend_build = os.path.join(settings.BASE_DIR, 'frontend_build')
    if os.path.exists(os.path.join(frontend_build, 'index.html')):
        urlpatterns += [re_path(r'^(?!api|admin|static).*$', TemplateView.as_view(template_name='index.html'))]
