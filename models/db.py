"""Database helper for habit-tracker.

Provides:
- get_db(): returns a SQLite connection with Row factory
- init_db(): applies schema.sql if tables do not exist
"""

from pathlib import Path
import sqlite3

def _db_path() -> Path:
    root = Path(__file__).resolve().parents[1]
    db_dir = root / "database"
    db_dir.mkdir(parents=True, exist_ok=True)
    return db_dir / "habits.db"

def _schema_path() -> Path:
    root = Path(__file__).resolve().parents[1]
    return root / "database" / "schema.sql"

def get_db():
    """Return a sqlite3.Connection to the application's database."""
    path = _db_path()
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database using schema.sql."""
    conn = get_db()
    schema_file = _schema_path()

    with open(schema_file, "r") as f:
        conn.executescript(f.read())

    conn.commit()
    conn.close()
