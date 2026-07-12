from flask import Flask, render_template
from routes.habits import habits_bp

def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )

    # Register API blueprint
    app.register_blueprint(habits_bp)

    # Main dashboard
    @app.get("/")
    def index_page():
        return render_template("index.html")

    # Habit form page (if you use it)
    @app.get("/habit-form")
    def habit_form_page():
        return render_template("habit_form.html")

    # Alias for index
    @app.get("/index")
    def index_alias_page():
        return render_template("index.html")

    return app

app = create_app()

