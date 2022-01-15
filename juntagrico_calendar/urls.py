from django.urls import path
from juntagrico_calendar import views

urlpatterns = [
    path('cal/jobs/json', views.jobs_as_json, name='jobs-json'),
    path('my/jobs', views.job_calendar, name='jobs'),  # overrides this url from juntagrico
]
