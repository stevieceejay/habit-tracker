# services/habits_service.py

from datetime import date, timedelta
from models.db import get_db

# ---------------------------------------
# Helpers
# ---------------------------------------

def _get_week_dates():
    """Return 7 ISO date strings for the current week (Sunday–Saturday)."""
    today = date.today()
    days_since_sunday = (today.weekday() + 1) % 7
    sunday = today - timedelta(days=days_since_sunday)
    return [(sunday + timedelta(days=i)).isoformat() for i in range(7)]


def _serialize_habit(row, logs):
    """Convert DB rows into the JSON shape expected by the frontend."""
    week_dates = _get_week_dates()
    completed_map = {log["log_date"]: bool(log["completed"]) for log in logs}

    return {
        "id": row["id"],
        "name": row["name"],
        "days": [completed_map.get(d, False) for d in week_dates]
    }


# ---------------------------------------
# Public Service Functions
# ---------------------------------------

def get_all_habits():
    """Return all habits with their weekly logs."""
    conn = get_db()
    habit_rows = conn.execute("SELECT * FROM habits ORDER BY id").fetchall()

    week_dates = _get_week_dates()
    placeholders = ",".join("?" * 7)

    habits = []
    for h in habit_rows:
        logs = conn.execute(
            f"""
            SELECT log_date, completed
            FROM habit_logs
            WHERE habit_id = ? AND log_date IN ({placeholders})
            """,
            (h["id"], *week_dates)
        ).fetchall()

        habits.append(_serialize_habit(h, logs))

    conn.close()
    return habits


def create_habit(name):
    """Insert a new habit."""
    conn = get_db()
    conn.execute("INSERT INTO habits (name) VALUES (?)", (name,))
    conn.commit()
    conn.close()


def remove_habit(habit_id):
    """Delete a habit (logs removed via ON DELETE CASCADE)."""
    conn = get_db()
    conn.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    conn.commit()
    conn.close()


def toggle_completion(habit_id, day_index):
    """Toggle completion for a specific day in the current week."""
    week_dates = _get_week_dates()
    log_date = week_dates[day_index]

    conn = get_db()

    existing = conn.execute(
        "SELECT completed FROM habit_logs WHERE habit_id = ? AND log_date = ?",
        (habit_id, log_date)
    ).fetchone()

    if existing:
        new_value = 0 if existing["completed"] else 1
        conn.execute(
            "UPDATE habit_logs SET completed = ? WHERE habit_id = ? AND log_date = ?",
            (new_value, habit_id, log_date)
        )
    else:
        conn.execute(
            "INSERT INTO habit_logs (habit_id, log_date, completed) VALUES (?, ?, 1)",
            (habit_id, log_date)
        )

    conn.commit()
    conn.close()


def reset_week():
    """Clear all logs for the current week."""
    week_dates = _get_week_dates()
    placeholders = ",".join("?" * len(week_dates))

    conn = get_db()
    conn.execute(
        f"DELETE FROM habit_logs WHERE log_date IN ({placeholders})",
        (*week_dates,)
    )
    conn.commit()
    conn.close()
