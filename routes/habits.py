from flask import Blueprint, jsonify, request
import sqlite3
import uuid

habits_bp = Blueprint("habits", __name__)

# -----------------------------------
# Database Helpers
# -----------------------------------
def get_db():
    conn = sqlite3.connect("habits.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            days TEXT NOT NULL,
            prev_rate INTEGER
        )
    """)
    conn.commit()
    conn.close()

init_db()

# -----------------------------------
# Utility
# -----------------------------------
def serialize(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "days": [d == "1" for d in row["days"].split(",")],
        "prevRate": row["prev_rate"]
    }

# -----------------------------------
# GET /habits
# -----------------------------------
@habits_bp.get("/habits")
def list_habits():
    conn = get_db()
    rows = conn.execute("SELECT * FROM habits").fetchall()
    conn.close()
    return jsonify([serialize(r) for r in rows]), 200

# -----------------------------------
# POST /habits
# -----------------------------------
@habits_bp.post("/habits")
def create_habit():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()

    if not name:
        return jsonify({"error": "Habit name is required"}), 400

    habit_id = uuid.uuid4().hex

    conn = get_db()
    conn.execute(
        "INSERT INTO habits (id, name, days, prev_rate) VALUES (?, ?, ?, ?)",
        (habit_id, name, "0,0,0,0,0,0,0", None)
    )
    conn.commit()
    conn.close()

    return jsonify({"id": habit_id, "name": name}), 201

# -----------------------------------
# POST /habits/toggle/<id>/<day>
# -----------------------------------
@habits_bp.post("/habits/toggle/<habit_id>/<int:day_index>")
def toggle_day(habit_id, day_index):
    conn = get_db()
    row = conn.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()

    if not row:
        return jsonify({"error": "Habit not found"}), 404

    days = row["days"].split(",")
    days[day_index] = "1" if days[day_index] == "0" else "0"

    conn.execute("UPDATE habits SET days = ? WHERE id = ?", (",".join(days), habit_id))
    conn.commit()
    conn.close()

    return jsonify({"updated": True}), 200

# -----------------------------------
# DELETE /habits/<id>
# -----------------------------------
@habits_bp.delete("/habits/<habit_id>")
def delete_habit(habit_id):
    conn = get_db()
    conn.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    conn.commit()
    conn.close()
    return jsonify({"deleted": habit_id}), 200

# -----------------------------------
# POST /reset-week
# -----------------------------------
@habits_bp.post("/reset-week")
def reset_week():
    conn = get_db()
    rows = conn.execute("SELECT * FROM habits").fetchall()

    for r in rows:
        days = [d == "1" for d in r["days"].split(",")]
        checked = sum(days)
        rate = round((checked / 7) * 100)

        conn.execute(
            "UPDATE habits SET prev_rate = ?, days = ? WHERE id = ?",
            (rate, "0,0,0,0,0,0,0", r["id"])
        )

    conn.commit()
    conn.close()

    return jsonify({"reset": True}), 200

# -----------------------------------
# GET /patterns
# -----------------------------------
@habits_bp.get("/patterns")
def patterns():
    conn = get_db()
    rows = conn.execute("SELECT * FROM habits").fetchall()
    conn.close()

    habits = [serialize(r) for r in rows]
    if not habits:
        return jsonify({"patterns": None}), 200

    # strongest + weakest
    rates = [{"name": h["name"], "rate": round(sum(h["days"]) / 7 * 100)} for h in habits]
    strongest = max(rates, key=lambda x: x["rate"])
    weakest = min(rates, key=lambda x: x["rate"])

    # drifting
    drifting = None
    for h in habits:
        if h["prevRate"] is not None:
            diff = round(sum(h["days"]) / 7 * 100) - h["prevRate"]
            if diff < 0:
                drifting = {"name": h["name"], "diff": diff}

    return jsonify({
        "strongest": strongest,
        "weakest": weakest,
        "drifting": drifting
    }), 200
