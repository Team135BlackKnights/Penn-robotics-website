import json
import logging
from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
import os
from logging import FileHandler
import sqlite3
from flask import make_response
from datetime import datetime, timezone

import sys
from databaseMain import *
from auth import *
from datetime import datetime, timedelta
from flask import session, redirect, url_for


current_directory = os.path.dirname(__file__)
log_file_path = os.path.join(current_directory, 'api.log')

api_logger = logging.getLogger('api_logger')
api_logger.setLevel(logging.INFO)

api_handler = FileHandler(log_file_path)
api_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
api_handler.setFormatter(api_formatter)
api_logger.addHandler(api_handler)

app = Flask(__name__)

flask_logger = logging.getLogger('werkzeug')
flask_logger.setLevel(logging.INFO)
flask_logger.addHandler(api_handler)

flask_logger.propagate = False



def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://127.0.0.1:5500", "http://127.0.0.1:5000"], supports_credentials=True)
    app.secret_key = os.urandom(24)  # Secret key for sessions

    @app.errorhandler(429)
    def rate_limit_handler(e):
        return jsonify(error="Too many requests. You are being rate limited."), 429

    @app.errorhandler(500)
    def internal_server_error(e):
        api_logger.error(f"Internal server error: {e}")
        return jsonify(error="An unexpected error occurred. Please try again later."), 500

    @app.route('/', methods=['GET'])
    def home():
        return "Penn High School Robotics API."
    @app.route('/check-login', methods=['GET'])
    def check_login():
        if 'logged_in' in session and session['logged_in']:
            # Check if login_time is present and within the valid timeframe
            if 'login_time' in session and (datetime.now(timezone.utc) - session['login_time']) < timedelta(minutes=30):
                return jsonify(logged_in=True)
            else:
                # Login expired, set logged_in to False
                session['logged_in'] = False
                return jsonify(logged_in=False)
        else:
            return jsonify(logged_in=False)
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Check credentials (admin and website135)
        if username == 'admin' and password == AUTH_TOKEN:
            session['logged_in'] = True  # Set session
            session['login_time'] = datetime.now(timezone.utc)
            return jsonify(message="Accepted"), 200  # Successful login message
        else:
            return jsonify(error="Invalid credentials"), 401  # Unauthorized
    @app.route('/make-post', methods=['POST'])
    def make_post():
        auth_header = request.headers.get('Authorization')

        if not auth_header or auth_header != f"Bearer {AUTH_TOKEN}":
            return jsonify(error="Unauthorized"), 401

        data = request.get_json()

        title = data.get('title')
        content = data.get('content_body')

        date = ("Published " + datetime.now().strftime('%m/%d/%Y'))
        author = data.get('author', None)
        footer = data.get('footer', None)
        image = data.get('image', None)
        file = data.get('file', None)
        video = data.get('video', None)

        make_a_post(title, content, date, author, footer, image, file, video)

        return jsonify(message="Post created successfully.", date=date), 201

    @app.route('/edit-post', methods=['POST'])
    def edit_post_api():
        auth_header = request.headers.get('Authorization')

        if not auth_header or auth_header != f"Bearer {AUTH_TOKEN}":
            return jsonify(error="Unauthorized"), 401

        data = request.get_json()
        post_id = data.get('id')

        if not post_id:
            return jsonify(error="Post ID is required"), 400

        updates = {key: value for key, value in data.items() if key != 'id' and value is not None}

        result = edit_post(post_id, updates)

        if "not found" in result:
            return jsonify(error=result), 404
        elif "No fields" in result:
            return jsonify(error=result), 400
        else:
            return jsonify(message=result), 200



    @app.route('/delete/<int:post_id>', methods=['DELETE'])
    def delete_post_route(post_id):
        auth_header = request.headers.get('Authorization')

        if not auth_header or auth_header != f"Bearer {AUTH_TOKEN}":
            return jsonify(error="Unauthorized"), 401

        deleted = delete_post(post_id)
        return deleted

    @app.route('/get-posts', methods=['GET'])
    def return_posts():
        post_list = get_posts()
        return jsonify(posts=post_list)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, use_reloader=False)