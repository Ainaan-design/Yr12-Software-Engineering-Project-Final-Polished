import os #module to deal with file paths used to pinpoint where the database is being setup.
from dotenv import load_dotenv

load_dotenv()

class Config:
    
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    #Going to look for the grabbit.db file within the current folder structure.
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'grabbit.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


