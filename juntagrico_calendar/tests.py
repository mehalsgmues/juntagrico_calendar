import datetime

from django.urls import reverse
from django.utils import timezone
from juntagrico.entity.jobs import RecuringJob

from juntagrico.tests import JuntagricoTestCase


class JobCalendarTests(JuntagricoTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.canceled_job = RecuringJob.objects.create(
            slots=1,
            time=timezone.now() + datetime.timedelta(hours=2),
            type=cls.job_type2,
        )
        cls.canceled_job.canceled = True
        cls.canceled_job.save()

    def testJobCalendar(self):
        self.assertGet(reverse('jobs-preview'))
        self.assertGet(reverse("jobs"))


    def testCalendarPartial(self):
        self.assertGet(reverse('job-calendar-partial'))
