from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    def setUp(self):
        """Stuff to do before each test."""
        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_home_page(self):
        """Ensure the session is made with appropriate variables."""
        with self.client:
            response = self.client.get('/')
            self.assertIn("board", session)
            self.assertIsNone(session.get("highscore"))
            self.assertIsNone(session.get("plays"))

    def test_valid_word(self):
        """Check if the word is valid."""
        with self.client as client: 
            with client.session_transaction() as sess:
                sess["board"] = [['m', 'i', 'c', 'e', 'e'],['n', 'i', 'c', 'e', 'e'],['n', 'i', 'c', 'e', 'e'],['n', 'i', 'c', 'e', 'e'],['n', 'i', 'c', 'e', 'e']]

        response = self.client.get('/guess?guess=mi')
        self.assertEqual(response.json['result'], 'ok')

    def test_invalid_word(self):
        self.client.get('/')
        response = self.client.get('/guess?guess=not')
        self.assertEqual(response.json['result'], 'not-on-board')

    def test_non_english_word(self):
        self.client.get('/')
        response = self.client.get('/guess?guess=sadfj;lkfja')
        self.assertEqual(response.json['result'], 'not-word')
        

