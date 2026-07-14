import sqlite3
from flask import Blueprint

habits_bp = Blueprint("habits", __name__)

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

    # Return all fields your frontend expects
    cur.execute("SELECT id, name, days, prev_rate FROM habits")
    rows = cur.fetchall()

    conn.close()
    return rows
