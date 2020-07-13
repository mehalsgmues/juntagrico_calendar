import re
from datetime import timedelta
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone

from juntagrico.entity.jobs import JobType, RecuringJob, OneTimeJob, Job
from juntagrico.views import get_menu_dict

from juntagrico_calendar.util.temporal import get_datetime_from_iso8601_string


@login_required
def job_calendar(request):
    """
    Job calendar/agenda view
    """
    renderdict = get_menu_dict(request)
    renderdict.update({
        'menu': {'jobs': 'active'},
    })
    return render(request, 'cal/job_calendar.html', renderdict)


@login_required
def jobs_as_json(request):
    """
    Get jobs as json object
    """
    now = timezone.localtime()
    print(now)
    start = get_datetime_from_iso8601_string(request.GET.get('start'),  now)
    end = get_datetime_from_iso8601_string(request.GET.get('end'), start + timedelta(days=7))
    search = request.GET.get('search')

    if search is None:
        jobs = Job.objects.filter(time__range=(start, end))
    elif search is not '':
        # if search term is passed, only search in parts, that frontend can't find
        jobtypes = JobType.objects.filter(recuringjob__time__range=(start, end))\
            .distinct().filter(description__iregex=search)
        rjobs = RecuringJob.objects.filter(time__range=(start, end), type__in=jobtypes)
        otjobs = OneTimeJob.objects.filter(time__range=(start, end), description__iregex=search)
        jobs = list(otjobs) + list(rjobs)
    else:
        jobs = []

    def text_ellipsis(x, limit):
        return x[:limit]+'...' if len(x) > limit else x

    def search_result_context(job):  # provide some context around the search results
        if search:
            result = re.findall(r'.{0,5}'+search+r'.{0,5}', job.type.description)
            return ' '.join(result)
        else:
            return ''

    def duration(job):
        """compatibility for juntagrico 1.2.2 and 1.2.3"""
        if hasattr(job, 'duration'):
            return job.duration  # juntagrico >=1.2.3
        return job.type.duration  # juntagrico <=1.2.2

    events = [
        {
            'id': str(job.id) + 's' if search else str(job.id),
            'title': job.type.get_name,
            'start': timezone.make_naive(job.time),
            'end': timezone.make_naive(job.time) + timedelta(hours=duration(job)),
            'url': reverse('job', args=(job.id,)),
            'classNames': [cls for cls, cond in {
                'past': job.time < now,
                'canceled': job.canceled,
                'is_core': job.is_core(),
            }.items() if cond],
            'extendedProps': {
                'area': job.type.activityarea.name,
                'location': job.type.location,
                'summary': text_ellipsis(job.type.description, 75),
                'occupied_places': job.occupied_places(),
                'slots': job.slots,
                'search_result': search_result_context(job)
            },
        }
        for job in jobs
    ]
    return JsonResponse(events, safe=False)
