from flask import Blueprint, jsonify, request

from services.habits_service import (
    create_habit,
    get_all_habits,
    remove_habit,
    toggle_completion,
    reset_week
)

habits_bp = Blueprint("habits", __name__)


@habits_bp.get("/health")
def health_check():
    return jsonify({"status": "ok"})


# ================================
# GET ALL HABITS (frontend expects array)
# ================================
@habits_bp.get("/habits")
def list_habits():
    habits = get_all_habits()
    return jsonify(habits), 200


# ================================
# CREATE HABIT
# ================================
@habits_bp.post("/habits")
def create_habit_route():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()

    if not name:
        return jsonify({"error": "Habit name is required"}), 400

    create_habit(name)

    # Return the newly created habit
    habits = get_all_habits()
    created = next((h for h in habits if h["name"] == name), None)

    return jsonify({"habit": created}), 201


# ================================
# DELETE HABIT
# ================================
@habits_bp.delete("/habits/<int:habit_id>")
def delete_habit_route(habit_id):
    remove_habit(habit_id)
    return jsonify({"deleted": habit_id}), 200


# ================================
# TOGGLE HABIT COMPLETION (correct route)
# ================================
@habits_bp.put("/habits/<int:habit_id>/toggle")
def toggle_habit_route(habit_id):
    payload = request.get_json(silent=True) or {}
    dayIndex = payload.get("dayIndex")

    if dayIndex is None:
        return jsonify({"error": "dayIndex is required"}), 400

    toggle_completion(habit_id, dayIndex)
    return jsonify({"updated": True}), 200



# ================================
# RESET WEEK
# ================================
@habits_bp.post("/reset-week")
def reset_week_route():
    reset_week()
    return jsonify({"reset": True}), 200
