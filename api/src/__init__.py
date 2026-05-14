from flask import Flask
import os
from .config.config import Config
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from .constant import SUPER_ADMIN, USER, PENDING, IN_PROGRESS, COMPLETED
from flask_jwt_extended import JWTManager

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

config = Config().dev_config

app.env = config.ENV

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI_DEV')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or os.environ.get('JWT_SECRET')

db = SQLAlchemy(app)

bcrypt = Bcrypt(app)

migrate = Migrate(app, db)

jwt = JWTManager(app)

from .models.user_model import User
from .models.task_model import Task

from .routes import api
app.register_blueprint(api, url_prefix='/api')