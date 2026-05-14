from flask import Response, json
from .. import db, PENDING
from ..models.task_model import Task
from ..models.user_model import User


def _serialize_task(task, username=None):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "user_id": task.user_id,
        "username": username,
    }


def _username_for(user_id):
    if user_id is None:
        return None
    u = db.session.get(User, user_id)
    if not u or not u.email:
        return None
    return u.email.split("@", 1)[0]


class TaskService:
    @staticmethod
    def get_task_object(id):
        """Return the raw Task ORM object (used for authorization checks)."""
        return db.session.query(Task).filter(Task.id == id).first()

    @staticmethod
    def get_all_task(page, page_size):
        total = db.session.query(Task).count()
        tasks = (
            db.session.query(Task)
            .order_by(Task.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        data = [_serialize_task(t, _username_for(t.user_id)) for t in tasks]
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Task data fetched successfully', 'data': data, 'total': total}
            ),
            status=200,
            mimetype='application/json',
        )

    @staticmethod
    def get_all_task_by_user_id(user_id):
        tasks = db.session.query(Task).filter(Task.user_id == user_id).order_by(Task.id.desc()).all()
        data = [_serialize_task(t, _username_for(t.user_id)) for t in tasks]
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Task data fetched successfully', 'data': data, 'total': len(data)}
            ),
            status=200,
            mimetype='application/json',
        )

    @staticmethod
    def get_task_by_id(id):
        task = db.session.query(Task).filter(Task.id == id).first()
        data = _serialize_task(task, _username_for(task.user_id)) if task else None
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Task data fetched successfully', 'data': data}
            ),
            status=200,
            mimetype='application/json',
        )

    @staticmethod
    def create_task(title, description):
        task = Task(title=title, description=description, status=PENDING)
        db.session.add(task)
        db.session.commit()
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Task created successfully', 'data': _serialize_task(task)}
            ),
            status=201,
            mimetype='application/json',
        )

    @staticmethod
    def update_task(id, title, description, user_id, status):
        task = db.session.query(Task).filter(Task.id == id).first()

        if not task:
            return Response(
                response=json.dumps(
                    {'status': 'error', 'message': 'Task not found'}
                ),
                status=404,
                mimetype='application/json',
            )

        if title:
            task.title = title
        if description:
            task.description = description
        if user_id:
            task.user_id = user_id
        if status:
            task.status = status

        db.session.commit()
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Task updated successfully', 'data': _serialize_task(task, _username_for(task.user_id))}
            ),
            status=200,
            mimetype='application/json',
        )

    @staticmethod
    def update_task_status(id, status):
        task = db.session.query(Task).filter(Task.id == id).first()

        if not task:
            return Response(
                response=json.dumps(
                    {'status': 'error', 'message': 'Task not found'}
                ),
                status=404,
                mimetype='application/json',
            )

        task.status = status
        db.session.commit()
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Task status updated successfully', 'data': _serialize_task(task, _username_for(task.user_id))}
            ),
            status=200,
            mimetype='application/json',
        )

    @staticmethod
    def assign_task_user(id, user_id):
        task = db.session.query(Task).filter(Task.id == id).first()

        if not task:
            return Response(
                response=json.dumps({'status': 'error', 'message': 'Task not found'}),
                status=404,
                mimetype='application/json',
            )

        task.user_id = user_id
        db.session.commit()
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Task assigned successfully', 'data': _serialize_task(task, _username_for(task.user_id))}
            ),
            status=200,
            mimetype='application/json',
        )

    @staticmethod
    def delete_task(id):
        task = db.session.query(Task).filter(Task.id == id).first()

        if not task:
            return Response(
                response=json.dumps(
                    {'status': 'error', 'message': 'Task not found'}
                ),
                status=404,
                mimetype='application/json',
            )

        deleted = _serialize_task(task)
        db.session.delete(task)
        db.session.commit()
        return Response(
            response=json.dumps(
                {'status': 'success', 'message': 'Task deleted successfully', 'data': deleted}
            ),
            status=200,
            mimetype='application/json',
        )
