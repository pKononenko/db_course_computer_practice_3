import os
import time
from flask import Flask
import psycopg2
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv


load_dotenv()

db = SQLAlchemy()
app = Flask(__name__)

DATABASE = os.getenv('DATABASE')
DATABASE_USERNAME = os.getenv('DATABASE_USERNAME')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')

app.config['SECRET_KEY'] = "key_key_chi2"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql+psycopg2://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@localhost:5432/{DATABASE}'

db.init_app(app)

import routes
