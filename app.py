from flask import Flask, render_template, send_from_directory
from routes.habits import habits_bp

def create_app():
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates"
    )

    app.register_blueprint(habits_bp)

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/habit-form")
    def habit_form():
        return render_template("habit_form.html")

    @app.get("/static/<path:filename>")
    def static_files(filename):
        return send_from_directory("static", filename)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
