import datetime
import re
from datetime import timedelta

from dateutil.relativedelta import relativedelta
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone

from juntagrico.entity.jobs import JobType, RecuringJob, OneTimeJob, Job, ActivityArea
from juntagrico.view_decorators import highlighted_menu

from juntagrico_calendar.util.temporal import get_datetime_from_iso8601_string, get_job_month_range


@login_required
@highlighted_menu('jobs')
def job_calendar(request):
    """
    Job calendar/agenda view
    """
    return render(request, 'cal/job_calendar.html')


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
    elif search != '':
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

    events = [
        {
            'id': str(job.id) + 's' if search else str(job.id),
            'title': job.type.get_name,
            'start': timezone.make_naive(job.time),
            'end': timezone.make_naive(job.time) + timedelta(hours=job.duration),
            'url': reverse('job', args=(job.id,)),
            'classNames': [cls for cls, cond in {
                'past': job.time < now,
                'canceled': job.canceled,
                'is_core': job.is_core(),
            }.items() if cond],
            'extendedProps': {
                'area': job.type.activityarea.name,
                'location': str(job.type.location),
                'summary': text_ellipsis(job.type.description, 75),
                'occupied_places': job.occupied_slots,
                'slots': job.slots,
                'search_result': search_result_context(job)
            },
        }
        for job in jobs
    ]
    return JsonResponse(events, safe=False)


@login_required
@highlighted_menu('jobs')
def job_calendar2(request, year=None, month=None):
    """
    Job calendar/agenda view
    """
    # TODO: only show full jobs by default to people that coordinate areas or can create/edit jobs
    today = datetime.date.today()
    show_previous = False
    if year and month:
        start_date = datetime.date(year=year, month=month, day=1)
        show_previous = start_date.replace(day=1) + relativedelta(months=-1)
    else:
        start_date = today
    until = start_date.replace(day=1) + relativedelta(months=2)
    jobs = Job.objects.filter(time__date__gte=start_date, time__date__lt=until).order_by('time')

    show_next = False
    if Job.objects.filter(time__date__gte=until).exists():
        show_next=until

    areas = ActivityArea.objects.filter(
        Q(jobtype__recuringjob__time__date__gte=today) | Q(onetimejob__time__date__gte=today)
    ).distinct().order_by('name')

    return render(request, 'cal2/job_calendar.html', {
        'jobs': jobs,
        'show_next': show_next,
        'show_previous': show_previous,
        'areas': areas,
        'months': get_job_month_range(today),
    })


@login_required
def partial_jobs_by_month(request, year, month):
    # TODO: Deduplicate with above
    today = datetime.date.today()
    start_date = max(datetime.date(year=year, month=month, day=1), today)
    until = start_date.replace(day=1) + relativedelta(months=1)
    jobs = Job.objects.filter(time__date__gte=start_date, time__date__lt=until).order_by('time')

    show_previous = False
    if start_date != today:
        show_previous = start_date + relativedelta(months=-1)

    show_next = False
    if Job.objects.filter(time__date__gte=until).exists():
        show_next = until

    return render(request, 'cal2/snippets/content.html', {
        'jobs': jobs,
        'show_next': show_next,
        'show_previous': show_previous,
    })


@login_required
def partial_calendar(request):
    return render(request, 'cal2/snippets/calendar.html', {
        'months': get_job_month_range(),
    })
