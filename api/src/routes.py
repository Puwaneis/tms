from flask import Blueprint
from .controllers.auth_controller import auth
from .controllers.task_controller import tasks
from .controllers.user_controller import user
from .controllers.dropdown_controller import dropdown

api = Blueprint('api', __name__)

api.register_blueprint(auth, url_prefix='/auth')
api.register_blueprint(tasks, url_prefix='/tasks')
api.register_blueprint(user, url_prefix='/user')
api.register_blueprint(dropdown, url_prefix='/dropdown')