#This imports the Flask application factory function from the app module.
from app import create_app
#This creates and initialises the Flask application instance.
app = create_app()
#This checks whether the file is being run directly or imported.
if __name__ == '__main__':
    #This starts the Flask development server with debugging enabled.
    app.run(debug=True)