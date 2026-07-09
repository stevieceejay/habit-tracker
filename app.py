from flask import Flask, render_template

from routes import habits_bp


def create_app():
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.register_blueprint(habits_bp)

    @app.get("/")
    def index_page():
        return render_template("index.html")

    @app.get("/habit-form")
    def habit_form_page():
        return render_template("habit_form.html")

    @app.get("/index")
    def index_alias_page():
        return render_template("index.html")

    return app


app = create_app()
