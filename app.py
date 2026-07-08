from datetime import date, timedelta
from models.db import get_db_connection

def get_week_dates():
    """Returns 7 ISO date strings for the current week, Sunday through Saturday."""
    today = date.today()
    days_since_sunday = (today.weekday() + 1) % 7 # Python's Monday=0 -> shift so Sunday=0
    sunday = today - timedelta(days=days_since_sunday)
    return [(sunday + timedelta(days=i)).isoformat() for i in range(7)]

def get_all_habits():
    conn = get_db_connection()
    habit_rows = conn.execute("SELECT * FROM habits ORDER BY id").fetchall()
    week_dates = get_week_dates()

    habits = []
    for h in habit_rows:
        placeholders = ",".join("?" * 7)
        logs = conn.execute(
            f"SELECT log_date, completed FROM habit_logs WHERE habit_id = ? AND log_date IN ({placeholders})",
            (h["id"], *week_dates)
        ).fetchall()
        completed_map = {row["log_date"]: bool(row["completed"]) for row in logs}
        days = [{"date": d, "completed": completed_map.get(d, False)} for d in week_dates]
        habits.append({"id": h["id"], "name": h["name"], "days": days})

    conn.close()
    return habits

def create_habit(name):
    conn = get_db_connection()
    conn.execute("INSERT INTO habits (name) VALUES (?)", (name,))
    conn.commit()
    conn.close()

def remove_habit(habit_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    conn.commit()
    conn.close()

def toggle_completion(habit_id, day_index):
    week_dates = get_week_dates()
    log_date = week_dates[day_index]
    conn = get_db_connection()

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