"""Date utilities for the habit-tracker.

Provides helper functions for working with weekly date ranges.
"""

from datetime import date, timedelta


def get_week_dates():
    """Return 7 ISO date strings for the current week, Sunday through Saturday."""
    today = date.today()
    # Python's weekday(): Monday=0 ... Sunday=6
    days_since_sunday = (today.weekday() + 1) % 7
    sunday = today - timedelta(days=days_since_sunday)
    return [(sunday + timedelta(days=i)).isoformat() for i in range(7)]
