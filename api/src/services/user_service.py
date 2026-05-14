from flask import Response, json
from .. import db
from ..models.user_model import User
from ..models.task_model import Task
from ..constant import COMPLETED, USER, IN_PROGRESS

class UserService:
    @staticmethod
    def get_all_user(page, page_size):
        users = (
            db.session.query(User)
            .filter(User.role == USER)
            .order_by(User.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        data = []
        for user in users:
            completed = (
                db.session.query(Task)
                .filter(Task.user_id == user.id, Task.status == COMPLETED)
                .count()
            )
            in_progress = (
                db.session.query(Task)
                .filter(Task.user_id == user.id, Task.status == IN_PROGRESS)
                .count()
            )
            assigned_task_count = (
                db.session.query(Task)
                .filter(Task.user_id == user.id)
                .count()
            )
            data.append(
                {
                    "id": user.id,
                    "name": user.email.split("@", 1)[0] if user.email else "",
                    "email": user.email,
                    "role": user.role,
                    "completed_task_count": completed,
                    "in_progress_task_count": in_progress,
                    "assigned_task_count": assigned_task_count,
                }
            )
        total = db.session.query(User).filter(User.role == USER).count()
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'User data fetched successfully', 'data': data, 'total': total}
            ),
            status=200,
            mimetype='application/json',
        )

    @staticmethod
    def get_each_user_completed_task_count():
        users = db.session.query(User).order_by(User.id.desc()).all()
        for user in users:
            tasks = db.session.query(Task).filter(
                Task.user_id == user.id, Task.status == COMPLETED
            ).all()
            user.completed_task_count = len(tasks)
        users = [user.__dict__ for user in users]
        for user in users:
            user.pop('_sa_instance_state', None)
            user.pop('password', None)
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'User completed task count fetched successfully', 'data': users}
            ),
            status=200,
            mimetype='application/json',
        )