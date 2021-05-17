import os
import time
from flask import Flask
import psycopg2
from flask_cors import CORS
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_praetorian import Praetorian
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
db = SQLAlchemy()
guard = Praetorian()
CORS(app)

from models import User, Deadline

DATABASE = os.getenv('DATABASE')
DATABASE_USERNAME = os.getenv('DATABASE_USER')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}

if os.environ.get('DATABASE_URL') is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql+psycopg2://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@localhost:5432/{DATABASE}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db.init_app(app)
guard.init_app(app, User)

with app.app_context():
    db.create_all()
    if not db.session.query(User).filter_by(username='Yasoob').count():
        db.session.add(User(
          username='Yasoob',
          password=guard.hash_password('strongpassword'),
          roles = 'admin'
            ))
    db.session.commit()


import routes
