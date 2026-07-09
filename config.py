import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
class config:
    DATABASE_PATH = os.path.join(BASE_DIR, "database", "habits.db")