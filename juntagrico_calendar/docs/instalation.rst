Installation
============

Basic Installation
------------------
Install calendar with :command:`pip`::

    $ pip install juntagrico_calendar

Django Settings
---------------
You have to add the app to your installed apps in your Django settings

.. code-block:: python

    INSTALLED_APPS = [
        ...
        'juntagrico',
        'juntagrico_calendar',
    ]
    
In the urls.py add this **before** including the juntagrico.urls:

.. code-block:: python

    path(r'', include('juntagrico_calendar.urls')),
