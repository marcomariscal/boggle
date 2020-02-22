from flask import Flask, request, render_template, redirect, flash, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from boggle import Boggle

app = Flask(__name__)
app.config['SECRET_KEY'] = "never-tell!"
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

debug = DebugToolbarExtension(app)

boggle_game = Boggle()

BOARD_KEY = 'board'

@app.route("/")
def start():
    """Render board."""
    session[BOARD_KEY] = boggle_game.make_board()

    return render_template('board.html', board=session[BOARD_KEY]) 


@app.route("/guess")
def is_valid_word():
    """Check if the guessed word is a valid word in the dictionary."""
    guess = request.args.get('guess')
    is_valid_word = boggle_game.check_valid_word(session[BOARD_KEY], guess)
    result = {"result": is_valid_word}

    return jsonify(result) 

@app.route("/score", methods=['POST'])
def best_score():
    """Get the score from the front end and return the highest score and the number of plays in the response."""
    score = request.json["score"]
    highscore = session.get('highscore', 0)
    session['highscore'] = max(highscore, score)
    plays = session.get('plays', 0)
    plays += 1

    score_result = {"highscore": session['highscore'], "plays": plays }

    return jsonify(score_result) 