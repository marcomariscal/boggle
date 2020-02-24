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
        """Ensure the session is made with appropriate variables and html is displayed."""
        with self.client as client:
            response = client.get('/')
            self.assertIn("board", session)
            self.assertIn("highscore", session)
            self.assertIn("plays", session)
            self.assertIn(b"<div><table id='board'>", response.data)
            self.assertIn(b"<p>Time Left:", response.data)

    def test_valid_word(self):
        """Check if the word is valid."""
        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [
                    ['n', 'i', 'c', 'e', 'e'],
                    ['n', 'i', 'c', 'e', 'e'],
                    ['n', 'i', 'c', 'e', 'e'],
                    ['n', 'i', 'c', 'e', 'e'],
                    ['n', 'i', 'c', 'e', 'e'], 
                    ['n', 'i', 'c', 'e', 'e']]

                response = client.get('/guess?guess=nice')
                self.assertEqual(response.json['result'], 'ok')

    def test_invalid_word(self):
        self.client.get('/')
        response = client.get('/guess?guess=not')
        self.assertEqual(response.json['result'], 'not-on-board')

    def test_non_english_word(self):
        self.client.get('/')
        response = client.get('/guess?guess=sadfj;lkfja')
        self.assertEqual(response.json['result'], 'not-word')
        

