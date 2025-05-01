import calendar
import datetime

from django.db.models import Min, F, Count, FloatField, Subquery, OuterRef
from django.db.models.functions import TruncDay, Cast
from django.template.defaultfilters import register
from django.utils.safestring import mark_safe
from juntagrico.entity.jobs import Job, Assignment


@register.filter(expects_localtime=True)
def get_local_hour(time):
    return time.hour + time.minute / 60


@register.filter(expects_localtime=True)
def get_local_date(time):
    return time.date()


class BootstrapCalendar(calendar.LocaleHTMLCalendar):
    cssclass_month = 'table calendar-month'

    def __init__(self, day_dots):
        super().__init__()
        self.day_dots = day_dots

    def formatmonth(self, theyear, themonth, withyear=True):
        self.cssclass_month += f' calendar-month-{theyear}-{themonth}'
        self.date = datetime.date(theyear, themonth, 1)
        return super().formatmonth(theyear, themonth, withyear)

    def formatday(self, day, weekday):
        if day != 0:
            return (f'<td class="calendar-day-{day} text-center">{day}'
                    f'<div class="calendar-dot {self.day_dots.get(day, "")}"></div></td>')
        return super().formatday(day, weekday)


@register.simple_tag(name='calendar')
def print_calendar(year=None, month=None):
    today = datetime.date.today()
    year = year or today.year
    month = month or today.month
    start_date = max(datetime.date(year, month, 1), today)
    end_date = datetime.date(year, month, calendar.monthrange(year, month)[1])
    # color dots where assignments are available
    job_status = Job.objects.filter(time__date__gte=start_date, time__date__lte=end_date).alias(
        used_slots=Subquery(Assignment.objects.filter(job=OuterRef('pk')).annotate(count=Count('pk')).values('count')[:1]),
    ).annotate(
        # Using subquery, because django and/or db doesn't do aggregation of aggregated value.
        status= F('used_slots') / Cast(F('slots'), output_field=FloatField()),
        date=TruncDay('time__date')
    ).values('date').annotate(lowest_status=Min('status', default=0)).values_list('date', 'lowest_status')
    job_status = {
        date.day: ('badge-danger' if status < 0.25 else 'badge-warning')
        for date, status in job_status
        if status < 1
    }
    return mark_safe(BootstrapCalendar(job_status).formatmonth(year, month))
