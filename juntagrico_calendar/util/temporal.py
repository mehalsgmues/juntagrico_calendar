import datetime

import iso8601
from dateutil.rrule import rrule, MONTHLY
from django.db.models import Max
from django.utils.timezone import template_localtime
from juntagrico.entity.jobs import Job


def get_datetime_from_iso8601_string(date_str, default):
    try:
        return iso8601.parse_date(date_str, default.tzinfo)
    except iso8601.ParseError:
        return default


def get_job_month_range(start=None):
    """ get month range where jobs exist
    """
    start = start or datetime.date.today()
    last_date = template_localtime(Job.objects.aggregate(Max('time'))['time__max'])
    if last_date:
        months = [
            (dt.date(), 'F Y' if dt.year != start.year else 'F')
            for dt in rrule(MONTHLY, dtstart=start.replace(day=1), until=datetime.date(last_date.year, last_date.month, 1))
        ]
    else:
        months = []
    return months
