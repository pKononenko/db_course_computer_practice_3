import datetime
from flask import request, jsonify
from models import User, Deadline
import flask_praetorian
from api import app, db, guard
from utils import date_transform


@app.route('/api/')
def home():
    return {"Hello": "World"}, 200

@app.route('/api/login', methods = ["POST"])
def login():
    req = request.get_json(force = True)
    username = req.get("username", None)
    password = req.get("password", None)
    user = guard.authenticate(username, password)
    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200

@app.route('/api/register', methods = ["POST"])
def register():
    req = request.get_json(force = True)
    username = req.get("username", None)
    password = req.get("password", None)
    password_confirm = req.get("password_confirm", None)

    if password_confirm.replace(" ", "") == "" or password.replace(" ", "") == "" or username.replace(" ", "") == "":
        return {"message": "Fill all input fields"}

    if password != password_confirm:
        return {"message": "Passwords doesn't match"}, 200

    if db.session.query(User).filter_by(username=username).count():
        return {"message": f"User with name {username} is already exists"}, 200

    user = User(username=username, password=guard.hash_password(password))
    
    # if something wrong happens
    prob_bool = False
    try:
        db.session.add(user)
        db.session.commit()
    except:
        db.session.rollback()
        prob_bool = True

    if prob_bool:
        return {"message": "try again later"}, 200

    user = guard.authenticate(username, password)
    ret = {'access_token': guard.encode_jwt_token(user)}

    return ret, 200

@app.route('/api/refresh', methods=['POST'])
def refresh():
    print("refresh request")
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200

@app.route('/api/add_deadline', methods=['POST'])
@flask_praetorian.auth_required
def add_deadline():
    req = request.get_json(force = True)
    user = flask_praetorian.current_user()
    subject = req.get("subject", None)
    task_name = req.get("task_name", None)
    description = req.get("description", None)
    date = req.get("date", None)

    date_obj = date_transform(date)

    if not (subject.replace(" ", "") and task_name.replace(" ", "") and description.replace(" ", "")):
        return {"message": "Fill all the fields"}

    deadline = Deadline(subject = subject, deadline_name = task_name, deadline_desc = description, deadline_date = date_obj, owner = user)
    success_bool = True
    try:
        db.session.add(deadline)
        db.session.commit()
    except:
        success_bool = False
        db.session.rollback()

    if not success_bool:
        return {"message": "Something went wrong. Try again"}

    ret = {'message': "OK", "deadline_id": deadline.deadline_id, "deadline_date": date_transform(date)}
    return ret, 200

@app.route('/api/delete_deadline', methods=['POST'])
@flask_praetorian.auth_required
def delete_deadline():
    req = request.get_json(force = True)
    deadline_id = req.get('deadline_id', None)
    user = flask_praetorian.current_user()

    deadline = db.session.query(Deadline).filter(Deadline.deadline_id == deadline_id).first()
    successful_bool = True
    try:
        db.session.delete(deadline)
        db.session.commit()
    except:
        successful_bool = False
        db.session.rollback()

    if not successful_bool:
        return {"message": "Something went wrong when deleting deadline"}

    ret = {'message': "Successfuly deleted"}
    return ret, 200

# Errors in React
# Return status
@app.route('/api/update_deadline', methods=['POST'])
@flask_praetorian.auth_required
def update_deadline():
    req = request.get_json(force = True)
    deadline_id = req.get('deadline_id', None)
    subject = req.get("subject", None)
    task_name = req.get("task_name", None)
    description = req.get("description", None)
    date = req.get("date", None)

    date_obj = date_transform(date)
    
    successful_bool = True
    deadline = Deadline.query.filter_by(deadline_id = deadline_id).first()

    try:
        deadline.subject = subject
        deadline.deadline_name = task_name
        deadline.deadline_desc = description
        deadline.deadline_date = date

        db.session.commit()
    except:
        successful_bool = False
        db.session.rollback()

    if not successful_bool:
        return {'message': 'Problems with updating deadline.'}

    ret = {'message': 'OK', 'deadline_date': date_transform(date)}
    return ret, 200

@app.route('/api/get_deadlines', methods=["GET"])
@flask_praetorian.auth_required
def get_deadlines():
    user = flask_praetorian.current_user()
    user_deadlines = user.deadline
    deadlines_dict = {}
    for num, deadline in enumerate(user_deadlines):
        deadlines_dict[f'Deadline {num + 1}'] = {k: v for k, v in deadline.__dict__.items() if k not in ('user_id', '_sa_instance_state', 'deadline_date')}
        deadlines_dict[f'Deadline {num + 1}']['deadline_date'] = deadline.deadline_date
    print(deadlines_dict)
    return jsonify(deadlines_dict)
