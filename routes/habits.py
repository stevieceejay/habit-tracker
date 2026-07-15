import sqlite3
from flask import Blueprint, jsonify, request

habits_bp = Blueprint("habits", __name__)

def get_conn():
    return sqlite3.connect("habits.db")

def save_habit(name):
    conn = get_conn()
    cur = conn.cursor()
    empty_days = "0,0,0,0,0,0,0"
    cur.execute(
        "INSERT INTO habits (name, days, prev_rate) VALUES (?, ?, ?)",
        (name, empty_days, None),
    )
    conn.commit()
    conn.close()

def get_habits():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, days, prev_rate FROM habits")
    rows = cur.fetchall()
    conn.close()
    return rows

@habits_bp.route("/habits", methods=["GET"])
def api_get_habits():
    rows = get_habits()
    habits = []
    for row in rows:
        habit_id, name, days_str, prev_rate = row
        days = [d == "1" for d in days_str.split(",")]
        habits.append({
            "id": habit_id,
            "name": name,
            "days": days,
            "prevRate": prev_rate,
        })
    return jsonify(habits)

@habits_bp.route("/habits", methods=["POST"])
def api_add_habit():
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "Name required"}), 400
    save_habit(name)
    return jsonify({"status": "ok"})

@habits_bp.route("/habits/toggle/<int:habit_id>/<int:day_index>", methods=["POST"])
def api_toggle_day(habit_id, day_index):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT days FROM habits WHERE id = ?", (habit_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Habit not found"}), 404

    days = row[0].split(",")
    days[day_index] = "1" if days[day_index] == "0" else "0"
    new_days_str = ",".join(days)

    cur.execute("UPDATE habits SET days = ? WHERE id = ?", (new_days_str, habit_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

@habits_bp.route("/habits/<int:habit_id>", methods=["DELETE"])
def api_delete_habit(habit_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "deleted"})
