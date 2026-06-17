from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()
#Defining a function which builds and returns the Flask applicaation
def create_app():
    #creating the flask application: 'Flask(__name__)' tells flask that this file is the main starting point of the app while 'static_folder=' tells flask that css and js files arent inside the app folder but rather the static. Furthermore, the 'template_folder=' line relays to flask that index.html is within the templates folder.
    app = Flask(__name__, static_folder="../static", template_folder="templates")
    #This line aims to load all the settings from the 'Config' class, so flask pulls in things like DATABASE URL and SQLAlchemy settings.
    app.config.from_object(Config)

    #This line attaches the database to the Flask app so it can be used.
    db.init_app(app)

    from app.routes import api_bp
    from app.main import main_bp
    
    #This tells Flask that all routes inside api_bp should start with /api. For example: @api_bp.route("/menu") becomes; /api/menu
    app.register_blueprint(api_bp, url_prefix="/api")
    #This registers normal website pages so no prefix. For example: @main_bp.route("/") stays as /.
    app.register_blueprint(main_bp)
    #This is basically Flask saying its temporarily activating the app so it can carry out database operations safely.
    with app.app_context():
        #This line reads my models, including MenuItem, Order and OrderItem and turns them into real tables within SQlite.
        db.create_all()
        #filling the database with menu items.
        _seed_menu()
    #This returns the fully built Flask application which includes a working system with a connected database, registered routes, formulated tables and pre-existing data which is inserted.
    return app
#Function used to pre-populate the database with menu items when the app starts.
def _seed_menu():
    from app.models import MenuItem
    #Checks if data already exists (In basic terms it helps prevent duplicates when the server is restarted more than once).
    if MenuItem.query.first():
        return 
    items = [
        MenuItem(name="Butter Chicken and Rice", price=5.50, description="Creamy butter chicken served with fluffy steamed rice", calories=720, is_popular=False, is_available=True, emoji="🍛"),
        MenuItem(name="Brownies", price=1.00, description="Rich chocolate brownie with a soft, fudgy centre", calories=380, is_popular=True, is_available=True, emoji="🍫"),
        MenuItem(name="Doner Kebab Roll", price=7.50, description="Seasoned doner meat, lettuce, tomato and garlic sauce wrapped in flatbread", calories=650, is_popular=False, is_available=True, emoji="🥙"),
        MenuItem(name="Chicken Burger", price=4.50, description="Crispy chicken fillet, lettuce and mayo on a toasted bun", calories=620, is_popular=False, is_available=True, emoji="🍔"),
        MenuItem(name="Hot Chips", price=3.50, description="Golden crispy potato chips lightly seasoned with salt", calories=450, is_popular=False, is_available=True, emoji="🍟"),
        MenuItem(name="Chicken Gyros", price=7.90, description="Marinated chicken, fresh salad and tzatziki wrapped in warm pita bread", calories=580, is_popular=True, is_available=True, emoji="🥙"),
        MenuItem(name="Chicken Nuggets", price=5.00, description="Tender chicken nuggets coated in a crispy golden crumb", calories=420, is_popular=True, is_available=True, emoji="🍗"),
        MenuItem(name="Meat Pie", price=4.50, description="Flaky golden pastry filled with savoury minced beef and gravy", calories=520, is_popular=True, is_available=True, emoji="🥧"),

    ]
    #This tells SQLAlchemy to prepare the above menu items for insertion.
    db.session.add_all(items)
    #This tells SQLAlchemy to actually write the items into the database.
    db.session.commit()
