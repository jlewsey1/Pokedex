from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dex = db.Column(db.Integer)
    name = db.Column(db.String(100))
    type = db.Column(db.String(50))
    set = db.Column(db.String(100))
    rarity = db.Column(db.String(100))
    description = db.Column(db.Text)
    image = db.Column(db.String(200))
    owned = db.Column(db.Boolean, default=False)
