import json
import os
from datetime import datetime

DB_PATH = "database/habits.json"


# ================================
# Load & Save Helpers
# ================================
def load_habits_from_db():
    if not os.path.exists(DB_PATH):
        return []

    with open(DB_PATH, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_habits_to_db(habits):
    with open(DB_PATH, "w") as f:
        json.dump(habits, f, indent=2)

def calculate_progress(days):
    completed = sum(1 for d in days if d)
    return completed / 7
# ================================
# Streak Calculation
# ================================
def calculate_streak(days):
    streak = 0
    for completed in days:
        if completed:
            streak += 1
        else:
            streak = 0
    return streak


# ================================
# Habit Expiration Logic
# ================================
def is_expired(days):
    # Expire if the first 3 days of the week are all missed
    return days[:3] == [False, False, False]


# ================================
# Get All Habits (attach streak + expired)
# ================================
def get_all_habits():
    habits = load_habits_from_db()

    for h in habits:
        h["streak"] = calculate_streak(h["days"])
        h["expired"] = is_expired(h["days"])
        h["progress"] = calculate_progress(h["days"])

    return habits


# ================================
# Create Habit
# ================================
def create_habit(name):
    habits = load_habits_from_db()

    new_habit = {
        "id": len(habits) + 1,
        "name": name,
        "days": [False, False, False, False, False, False, False],
        "created_at": datetime.utcnow().isoformat()
    }

    habits.append(new_habit)
    save_habits_to_db(habits)


# ================================
# Remove Habit
# ================================
def remove_habit(habit_id):
    habits = load_habits_from_db()
    habits = [h for h in habits if h["id"] != habit_id]
    save_habits_to_db(habits)


# ================================
# Toggle Completion
# ================================
def toggle_completion(habit_id, day_index):
    habits = load_habits_from_db()

    for h in habits:
        if h["id"] == habit_id:
            # Flip the boolean
            h["days"][day_index] = not h["days"][day_index]

            # Update streak + expiration
            h["streak"] = calculate_streak(h["days"])
            h["expired"] = is_expired(h["days"])

            # Track last updated time
            h["last_updated"] = datetime.utcnow().isoformat()

            break

    save_habits_to_db(habits)


# ================================
# Reset Week
# ================================
def reset_week():
    habits = load_habits_from_db()

    for h in habits:
        h["days"] = [False] * 7
        h["streak"] = 0
        h["expired"] = False

    save_habits_to_db(habits)

