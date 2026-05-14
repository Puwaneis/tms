from flask import Response, json
from .. import db
from ..models.user_model import User
from ..models.task_model import Task
from ..constant import USER


class DropdownService:
    @staticmethod
    def get_dropdown_user(keyword):
        query = db.session.query(User).filter(User.role == USER)
        if keyword:
            query = query.filter(User.email.like(f'%{keyword}%'))
        users = query.order_by(User.id.asc()).limit(20).all()
        data = [{'id': u.id, 'email': u.email} for u in users]
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Dropdown data fetched successfully', 'data': data}
            ),
            status=200,
            mimetype='application/json',
        )

    @staticmethod
    def get_dropdown_task(keyword):
        query = db.session.query(Task)
        if keyword:
            query = query.filter(Task.title.like(f'%{keyword}%'))
        tasks = query.order_by(Task.id.asc()).limit(20).all()

        assignee_ids = {t.user_id for t in tasks if t.user_id is not None}
        usernames = {}
        if assignee_ids:
            rows = db.session.query(User.id, User.email).filter(User.id.in_(assignee_ids)).all()
            usernames = {uid: (email.split('@', 1)[0] if email else None) for uid, email in rows}

        data = [
            {
                'id': t.id,
                'title': t.title,
                'status': t.status,
                'user_id': t.user_id,
                'username': usernames.get(t.user_id),
            }
            for t in tasks
        ]
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Dropdown data fetched successfully', 'data': data}
            ),
            status=200,
            mimetype='application/json',
        )
