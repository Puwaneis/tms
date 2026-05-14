from flask import Blueprint, request
from ..services.dropdown_service import DropdownService
from flask_jwt_extended import jwt_required

dropdown = Blueprint('dropdown', __name__)


@dropdown.route('/user', methods=['GET'])
@jwt_required()
def get_dropdown_user():
    keyword = request.args.get('keyword', '')
    return DropdownService.get_dropdown_user(keyword)


@dropdown.route('/task', methods=['GET'])
@jwt_required()
def get_dropdown_task():
    keyword = request.args.get('keyword', '')
    return DropdownService.get_dropdown_task(keyword)
