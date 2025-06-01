from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pokedex.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dex = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), unique=True, nullable=False)
    type = db.Column(db.String(50))
    set = db.Column(db.String(100))
    rarity = db.Column(db.String(100))
    description = db.Column(db.Text)
    image = db.Column(db.String(200))
    owned = db.Column(db.Boolean, default=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/cards')
def get_cards():
    cards = Card.query.all()
    return jsonify([{
        'dex': card.dex,
        'name': card.name,
        'type': card.type,
        'set': card.set,
        'rarity': card.rarity,
        'description': card.description,
        'image': card.image,
        'owned': card.owned
    } for card in cards])



app.secret_key = 'some_secret_key'

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if request.method == 'POST':
        # Grab form data
        try:
            dex = int(request.form['dex'])
            name = request.form['name']
            type_ = request.form['type']
            set_ = request.form['set']
            rarity = request.form['rarity']
            description = request.form['description']
            image = request.form['image']
            owned = request.form.get('owned') == 'on'  # checkbox
            
            # Check if card already exists (optional)
            existing_card = Card.query.filter_by(name=name).first()
            if existing_card:
                flash('Card with that name already exists.', 'error')
                return redirect(url_for('admin'))
            
            # Create and add new card
            new_card = Card(
                dex=dex,
                name=name,
                type=type_,
                set=set_,
                rarity=rarity,
                description=description,
                image=image,
                owned=owned
            )
            db.session.add(new_card)
            db.session.commit()
            flash('Card added successfully!', 'success')
            return redirect(url_for('admin'))
        except Exception as e:
            flash(f'Error adding card: {e}', 'error')
            return redirect(url_for('admin'))

    # GET request: show the form
    cards = Card.query.order_by(Card.dex).all()  # fetch all cards for display
    return render_template('admin.html', cards=cards)

@app.route('/delete_card/<int:card_id>', methods=['POST'])
def delete_card(card_id):
    card = Card.query.get_or_404(card_id)
    try:
        db.session.delete(card)
        db.session.commit()
        flash(f"Deleted card {card.name} successfully.", "success")
    except Exception as e:
        flash(f"Error deleting card: {e}", "error")
    return redirect(url_for('admin'))

@app.route('/edit/<int:card_id>', methods=['GET', 'POST'])
def edit_card(card_id):
    card = Card.query.get_or_404(card_id)

    if request.method == 'POST':
        try:
            card.dex = int(request.form['dex'])
            card.name = request.form['name']
            card.type = request.form['type']
            card.set = request.form['set']
            card.rarity = request.form['rarity']
            card.description = request.form['description']
            card.image = request.form['image']
            card.owned = request.form.get('owned') == 'on'

            db.session.commit()
            flash('Card updated successfully!', 'success')
            return redirect(url_for('admin'))
        except Exception as e:
            flash(f'Error updating card: {e}', 'error')
            return redirect(url_for('edit_card', card_id=card_id))

    return render_template('edit_card.html', card=card)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)