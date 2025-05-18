from django.db.models import Count, F, Q
from django.template.defaultfilters import register
from django.utils import timezone
from juntagrico.entity.jobs import Job


@register.inclusion_tag('cal2/snippets/content.html')
def next_jobs(limit=10, compact=True):
    return {
        'jobs': Job.objects.annotate(
            used_slots=Count('assignment'),
        ).filter(
            Q(infinite_slots=True) | Q(used_slots__lt=F('slots')),
            canceled=False,
            time__gte=timezone.now(),
        ).order_by('time')[:limit],
        'compact': compact,
    }
