from models.db import get_db_connection
from models.dates import get_week_dates


def get_all_habits():
    conn = get_db_connection()
    habit_rows = conn.execute("SELECT * FROM habits ORDER BY id").fetchall()
    week_dates = get_week_dates()

    habits = []
    for habit in habit_rows:
        placeholders = ",".join("?" * 7)
        logs = conn.execute(
            f"SELECT log_date, completed FROM habit_logs WHERE habit_id = ? AND log_date IN ({placeholders})",
            (habit["id"], *week_dates),
        ).fetchall()
        completed_map = {row["log_date"]: bool(row["completed"]) for row in logs}
        days = [{"date": day, "completed": completed_map.get(day, False)} for day in week_dates]
        habits.append({"id": habit["id"], "name": habit["name"], "days": days})

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

    if not 0 <= day_index < len(week_dates):
        raise ValueError("day_index out of range")

    log_date = week_dates[day_index]
    conn = get_db_connection()

    habit = conn.execute("SELECT id FROM habits WHERE id = ?", (habit_id,)).fetchone()
    if not habit:
        conn.close()
        raise ValueError("Habit does not exist")

    existing = conn.execute(
        "SELECT completed FROM habit_logs WHERE habit_id = ? AND log_date = ?",
        (habit_id, log_date),
    ).fetchone()

    if existing:
        new_value = 0 if existing["completed"] else 1
        conn.execute(
            "UPDATE habit_logs SET completed = ? WHERE habit_id = ? AND log_date = ?",
            (new_value, habit_id, log_date),
        )
    else:
        conn.execute(
            "INSERT INTO habit_logs (habit_id, log_date, completed) VALUES (?, ?, 1)",
            (habit_id, log_date),
        )

    conn.commit()
    conn.close()
