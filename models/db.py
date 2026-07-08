"""Database helper for habit-tracker.

Provides a simple `get_db_connection()` function expected by `app.py`.
Uses SQLite and returns a connection with `sqlite3.Row` row factory.
"""
from pathlib import Path
import sqlite3


def _db_path() -> Path:
    root = Path(__file__).resolve().parents[1]
    db_dir = root / "database"
    db_dir.mkdir(parents=True, exist_ok=True)
    return db_dir / "habits.db"


def get_db_connection():
    """Return a sqlite3.Connection to the application's database."""
    path = _db_path()
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn
