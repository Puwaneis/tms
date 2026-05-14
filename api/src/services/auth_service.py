from datetime import datetime, timedelta, timezone

from flask import Response, json
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token

from .. import db, bcrypt, SUPER_ADMIN, USER, jwt
from ..models.user_model import User

class AuthService:
    @staticmethod
    def register(email, password, confirm_password):
        if not email or not password:
            return Response(
                response=json.dumps(
                    {'status': 'error', 'message': 'Email and password are required'}
                ),
                status=400,
                mimetype='application/json',
            )

        if password != confirm_password:
            return Response(
                response=json.dumps(
                    {'status': 'error', 'message': 'Passwords do not match'}
                ),
                status=400,
                mimetype='application/json',
            )

        hashed_password = bcrypt.generate_password_hash(password)

        has_any_user = db.session.query(User.id).first() is not None
        role = USER if has_any_user else SUPER_ADMIN
        user = User(email=email, password=hashed_password, role=role)
        
        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return Response(
                response=json.dumps(
                    {'status': 'error', 'message': 'Email already registered'}
                ),
                status=409,
                mimetype='application/json',
            )

        return Response(
            response=json.dumps({'status': 'success'}),
            status=201,
            mimetype='application/json',
        )

    @staticmethod
    def login(email, password):
        if not email or not password:
            return Response(
                response=json.dumps(
                    {'status': 'error', 'message': 'Email and password are required'}
                ),
                status=400,
                mimetype='application/json',
            )

        user = User.query.filter_by(email=email).first()
        if not user or not bcrypt.check_password_hash(user.password, password):
            return Response(
                response=json.dumps(
                    {'status': 'error', 'message': 'Invalid credentials'}
                ),
                status=401,
                mimetype='application/json',
            )

        token = create_access_token(
            identity=str(user.id),
            additional_claims={'role': user.role},
        )

        return Response(
            response=json.dumps({'status': 'success', 'message': 'Login successful', 'token': token}),
            status=200,
            mimetype='application/json',
        )
