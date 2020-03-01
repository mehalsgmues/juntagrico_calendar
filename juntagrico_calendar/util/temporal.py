import iso8601


def get_datetime_from_iso8601_string(date_str, default):
    try:
        return iso8601.parse_date(date_str, default.tzinfo)
    except iso8601.ParseError:
        return default
