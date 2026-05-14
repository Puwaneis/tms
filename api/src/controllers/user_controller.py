from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt

from ..constant import SUPER_ADMIN
from ..services.user_service import UserService

user = Blueprint('user', __name__)

def _require_super_admin():
    claims = get_jwt()
    if claims.get('role') != SUPER_ADMIN:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    return None


@user.route('/all', methods=['GET'])
@jwt_required()
def get_all_user():
    forbidden = _require_super_admin()
    if forbidden is not None:
        return forbidden
    page = request.args.get('page', default=1, type=int) or 1
    page_size = request.args.get('pageSize', default=10, type=int) or 10
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    return UserService.get_all_user(page, page_size)


@user.route('/each-user-completed-task-count', methods=['GET'])
@jwt_required()
def get_each_user_completed_task_count():
    forbidden = _require_super_admin()
    if forbidden is not None:
        return forbidden
    return UserService.get_each_user_completed_task_count()
