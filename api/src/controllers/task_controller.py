from flask import Blueprint, request, jsonify
from ..services.task_service import TaskService
from ..constant import SUPER_ADMIN
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

tasks = Blueprint('tasks', __name__)


def _require_super_admin():
    claims = get_jwt()
    if claims.get('role') != SUPER_ADMIN:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    return None


@tasks.route('/all', methods=['GET'])
@jwt_required()
def get_all_task():
    forbidden = _require_super_admin()
    if forbidden is not None:
        return forbidden
    page = request.args.get('page', default=1, type=int) or 1
    page_size = request.args.get('pageSize', default=10, type=int) or 10
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    return TaskService.get_all_task(page, page_size)


@tasks.route('/all-by-user-id/<int:user_id>', methods=['GET'])
@jwt_required()
def get_all_task_by_user_id(user_id):
    claims = get_jwt()
    current_user_id = int(get_jwt_identity())
    if claims.get('role') != SUPER_ADMIN and current_user_id != user_id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    return TaskService.get_all_task_by_user_id(user_id)


@tasks.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_task_by_id(id):
    forbidden = _require_super_admin()
    if forbidden is not None:
        return forbidden
    return TaskService.get_task_by_id(id)


@tasks.route('/create', methods=['POST'])
@jwt_required()
def create_task():
    forbidden = _require_super_admin()
    if forbidden is not None:
        return forbidden
    title = request.json.get('title')
    description = request.json.get('description')
    if not title or not description:
        return jsonify({'status': 'error', 'message': 'Title and description are required'}), 400
    return TaskService.create_task(title, description)


@tasks.route('/update/<int:id>', methods=['PUT'])
@jwt_required()
def update_task(id):
    forbidden = _require_super_admin()
    if forbidden is not None:
        return forbidden
    title = request.json.get('title')
    description = request.json.get('description')
    user_id = request.json.get('user_id')
    status = request.json.get('status')
    if not title or not description or not user_id or not status:
        return jsonify({'status': 'error', 'message': 'Title, description, user_id and status are required'}), 400
    return TaskService.update_task(id, title, description, user_id, status)


@tasks.route('/update-status/<int:id>', methods=['PUT'])
@jwt_required()
def update_task_status(id):
    claims = get_jwt()
    current_user_id = int(get_jwt_identity())
    if claims.get('role') != SUPER_ADMIN:
        task = TaskService.get_task_object(id)
        if task is None or task.user_id != current_user_id:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    status = request.json.get('status')
    if not status:
        return jsonify({'status': 'error', 'message': 'Status is required'}), 400
    return TaskService.update_task_status(id, status)


@tasks.route('/assign/<int:id>', methods=['PUT'])
@jwt_required()
def assign_task_user(id):
    forbidden = _require_super_admin()
    if forbidden is not None:
        return forbidden
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'user_id is required'}), 400
    return TaskService.assign_task_user(id, user_id)


@tasks.route('/delete/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_task(id):
    forbidden = _require_super_admin()
    if forbidden is not None:
        return forbidden
    return TaskService.delete_task(id)
