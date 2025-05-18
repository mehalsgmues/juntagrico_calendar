from django.urls import path
from juntagrico_calendar import views

urlpatterns = [
    path('cal/jobs/json', views.jobs_as_json, name='jobs-json'),
    path('my/jobs', views.job_calendar, name='jobs'),  # overrides this url from juntagrico
    path('jobs/preview', views.job_calendar2, name='jobs-preview'),

    path('jobs/switch/calendar/<int:use_new>', views.switch_calendar, name='job-calendar-switch'),
    path('jobs/<int:year>/<int:month>', views.job_calendar2, name='jobs-by-month'),
    path('jobs/<int:year>/<int:month>/partial', views.job_calendar2, {'partial': True}, name='partial-jobs-by-month'),
    path('jobs/calendar/partial', views.partial_calendar, name='job-calendar-partial'),
    path('jobs/archive', views.job_archive, name='jobs-archive'),
    path('jobs/archive/<int:year>/<int:month>', views.job_archive, name='jobs-archive-by-month'),
]
