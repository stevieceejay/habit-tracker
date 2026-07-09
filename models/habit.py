from models.db import get_db_connection
from datetime import date, timedelta

def toggle_completion(habit_id, day_index):
    week_dates = get_week_dates()

    if not 0 <= day_index < len(week_dates):
        raise ValueError("day_index out of range")

    log_date = week_dates[day_index]
    conn = get_db_connection()

    # Ensure habit exists
    habit = conn.execute(
        "SELECT id FROM habits WHERE id = ?", (habit_id,)
    ).fetchone()
    if not habit:
        conn.close()
        raise ValueError("Habit does not exist")

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
