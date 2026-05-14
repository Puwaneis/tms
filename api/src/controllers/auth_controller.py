from flask import Blueprint, request

from ..services.auth_service import AuthService

auth = Blueprint('auth', __name__)


@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword') or data.get('confirm_password')
    return AuthService.register(email=email, password=password, confirm_password=confirm_password)


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    return AuthService.login(email=data.get('email'), password=data.get('password'))
