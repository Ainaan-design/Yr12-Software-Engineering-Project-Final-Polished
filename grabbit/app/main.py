from flask import Blueprint, render_template

# This file defines the main Blueprint for the application,
# which handles basic webpage routing (frontend pages).
# It separates page rendering logic from API/backend logic
# for better structure and maintainability.
main_bp = Blueprint("main", __name__)

# This route loads the homepage of the application.
# When users visit the root URL "/", it renders the index.html template.
# The template contains the frontend interface that interacts with the API.
@main_bp.route("/")
def index():
    return render_template("index.html")