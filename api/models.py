import datetime
from api import db

class User(db.Model):
    __tabelname__ = "user"

    # columns
    user_id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.Text, index = True, unique = True)
    password = db.Column(db.Text)
    #email = db.Column(db.String(120), index = True, unique = True)
    roles = db.Column(db.Text)
    deadline = db.relationship("Deadline", backref = 'owner')

    #def __repr__(self):
    #    return f'<User | username = {username}; email = {email}>'

    @property
    def rolenames(self):
        try:
            return self.roles.split(',')
        except Exception:
            return []

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.user_id


class Deadline(db.Model):
    __tablename__ = "deadline"

    deadline_id = db.Column(db.Integer, primary_key = True)
    subject = db.Column(db.String(128))
    deadline_name = db.Column(db.String(128))
    deadline_desc = db.Column(db.String())
    deadline_date = db.Column(db.DateTime)
    #complete_bool = db.Column(db.Boolean, default = False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
