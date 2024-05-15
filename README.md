# calendar

This is an extension for juntagrico. You can find more information about juntagrico here
(https://github.com/juntagrico/juntagrico)

## Installation

Install juntagrico-calendar via `pip`

    $ pip install juntagrico-calendar

or add it in your projects `requirements.txt`

In `settings.py` add `'juntagrico_calendar'`, somewhere **above** `'juntagrico',`.

```python
INSTALLED_APPS = [
    ...
    'juntagrico_calendar',
    'juntagrico',
]
```

In your `urls.py` you also need to extend the pattern (**above** the juntagrico urls):

```python
urlpatterns = [
    ...
    path('', include('juntagrico_calendar.urls')),
    # include juntagrico urls below
]
```

Redeploy your project (and apply migrations)
