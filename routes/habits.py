import sqlite3
from flask import Blueprint, jsonify, request

habits_bp = Blueprint("habits", __name__)

# ================================
# DB Helpers
# ================================
def save_habit(name):
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()

    # Initialize all 7 days as unchecked
    empty_days = "0,0,0,0,0,0,0"

    cur.execute(
        "INSERT INTO habits (name, days, prev_rate) VALUES (?, ?, ?)",
        (name, empty_days, None)
    )

    conn.commit()
    conn.close()


def get_habits():
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()

    cur.execute("SELECT id, name, days, prev_rate FROM habits")
    rows = cur.fetchall()

    conn.close()
    return rows


# ================================
# Routes
# ================================

# GET all habits (frontend expects full JSON)
@habits_bp.route("/habits", methods=["GET"])
def api_get_habits():
    rows = get_habits()

    habits = []
    for row in rows:
        habit_id, name, days_str, prev_rate = row

        # Convert "0,0,0,0,0,0,0" → [False, False, ...]
        days = [d == "1" for d in days_str.split(",")]

        habits.append({
            "id": habit_id,
            "name": name,
            "days": days,
            "prevRate": prev_rate
        })

    return jsonify(habits)


# POST create habit
@habits_bp.route("/habits", methods=["POST"])
def api_add_habit():
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Name required"}), 400

    save_habit(name)
    return jsonify({"status": "ok"})
