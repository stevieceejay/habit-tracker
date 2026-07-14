from flask import Flask, render_template, send_from_directory, request, redirect, url_for
from routes.habits import habits_bp, save_habit, get_habits

def create_app():
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates"
    )

    app.register_blueprint(habits_bp)

    @app.get("/")
    def index():
        habits = get_habits()
        return render_template("index.html", habits=habits)

    @app.route("/habit-form", methods=["GET", "POST"])
    def habit_form():
        if request.method == "POST":
            habit_name = request.form.get("habit-name")
            save_habit(habit_name)
            return redirect(url_for("index"))

        return render_template("habit_form.html")

    @app.get("/static/<path:filename>")
    def static_files(filename):
        return send_from_directory("static", filename)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
