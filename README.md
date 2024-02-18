# calendar

This is an extension for juntagrico. You can find more information about juntagrico here
(https://github.com/juntagrico/juntagrico)

## Installation

1. Add `juntagrico-calendar` to your `requirements.txt`
2. Add `'juntagrico_calendar',` to the `INSTALLED_APPS` in your `settings.py` **above** `juntagrico`
3. Add `path('', include('juntagrico_calendar.urls')),` in your `urls.py` **above** the juntagrico urls
4. Redeploy your project (and apply migrations)

## Release Notes

## 1.5

* Compatibility to Juntagrico 1.5
* Fix strike through on cancelled jobs in agenda view

### 1.5.1

* Fix job submenu

## 1.4

* Upgrade to Juntagrico 1.4

### 1.4.1

* Compatibility to Juntagrico 1.4.6
