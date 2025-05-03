from django.apps import AppConfig


class JuntagricoCalendarAppconfig(AppConfig):
    name = "juntagrico_calendar"

    def ready(self):
        from juntagrico.util import addons
        addons.config.register_version(self.name)

        # patch job # TODO: remove in juntagrico 2.0
        from juntagrico.entity.jobs import Job
        from django.utils import timezone
        def has_started(job):
            return job.time < timezone.now()
        Job.started = has_started
