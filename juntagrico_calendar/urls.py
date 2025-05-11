from django.urls import path
from juntagrico_calendar import views

urlpatterns = [
    path('cal/jobs/json', views.jobs_as_json, name='jobs-json'),
    path('my/jobs', views.job_calendar, name='jobs'),  # overrides this url from juntagrico
    path('jobs/preview', views.job_calendar2, name='jobs-preview'),
    path('jobs/<int:year>/<int:month>', views.job_calendar2, name='jobs-by-month'),
    path('jobs/<int:year>/<int:month>/partial', views.partial_jobs_by_month, name='partial-jobs-by-month'),
]
