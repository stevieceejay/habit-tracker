import sqlite3
from flask import Blueprint

habits_bp = Blueprint("habits", __name__)

def save_habit(name):
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO habits (name) VALUES (?)",
        (name,)
    )

    conn.commit()
    conn.close()

def get_habits():
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()

    cur.execute("SELECT id, name FROM habits")
    rows = cur.fetchall()

    conn.close()
    return rows
