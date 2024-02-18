from django.apps import AppConfig


class JuntagricoCalendarAppconfig(AppConfig):
    name = "juntagrico_calendar"

    def ready(self):
        from juntagrico.util import addons
        addons.config.register_version(self.name)
