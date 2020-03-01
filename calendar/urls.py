from django.conf.urls import url
from calendar import views

urlpatterns = [
    url(r'^cal/home$', views.home)
]
