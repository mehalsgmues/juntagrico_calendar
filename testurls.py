"""
test URL Configuration for calendar development
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('juntagrico_calendar.urls')),
    path('', include('juntagrico.urls')),
]
