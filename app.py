from flask import Flask, render_template
from routes.habits import habits_bp

app = Flask(__name__)
app.register_blueprint(habits_bp)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/habit-form")
def habit_form():
    return render_template("habit_form.html")

@app.route("/analysis")
def analysis():
    return render_template("analysis.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0")
