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


@habits_bp.get("/habits")
def list_habits():
    habits = get_all_habits()
    return jsonify({"habits": habits}), 200


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


@habits_bp.delete("/habits/<int:habit_id>")
def delete_habit_route(habit_id):
    remove_habit(habit_id)
    return jsonify({"deleted": habit_id}), 200


@habits_bp.post("/habits/check/<int:habit_id>/<int:day_index>")
def toggle_habit_route(habit_id, day_index):
    toggle_completion(habit_id, day_index)
    return jsonify({"updated": True}), 200


@habits_bp.post("/reset-week")
def reset_week_route():
    reset_week()
    return jsonify({"reset": True}), 200
