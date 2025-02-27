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
from flask import send_from_directory


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

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def create_app():
    app = Flask(__name__)
    CORS(app, origins=["https://pennrobotics.org"], supports_credentials=True)
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

        # Check credentials (AUTH_USER and AUTH_TOKEN)
        if username == AUTH_USER and password == AUTH_TOKEN:
            session['logged_in'] = True  # Set session
            session['login_time'] = datetime.now(timezone.utc)
            return jsonify(message="Accepted"), 200  # Successful login message
        else:
            return jsonify(error="Invalid credentials"), 401  # Unauthorized
        
    @app.route('/make-post', methods=['POST'])
    def make_post():
        if not session.get('logged_in'):
            return jsonify(error="Unauthorized"), 401

        title = request.form.get('title')
        content = request.form.get('content_body')
        author = request.form.get('author', None)
        footer = request.form.get('footer', None)
        image = request.files.get('image')

        image_path = None
        if image:
            image_path = os.path.join(UPLOAD_FOLDER, image.filename)
            image.save(image_path)

        date = ("Published " + datetime.now().strftime('%m/%d/%Y'))
        make_a_post(title, content, date, author, footer, image_path, None, None)

        return jsonify(message="Post created successfully.", date=date), 201
    @app.route('/get-post/<int:post_id>', methods=['GET'])
    def get_post(post_id):
        """
        Fetch a post by its ID and return the post data, including the image URL.
        """
        post = get_post_by_id(post_id)  # Fetch the post by ID

        if not post:
            return jsonify(error="Post not found"), 404
        return jsonify(post), 200
    @app.route('/edit-post', methods=['POST'])
    def edit_post_api():
        if not session.get('logged_in'):
            return jsonify(error="Unauthorized"), 401

        post_id = request.form.get('id')
        if not post_id:
            return jsonify(error="Post ID is required"), 400

        updates = {
            'title': request.form.get('title'),
            'content_body': request.form.get('content_body'),
            'author': request.form.get('author'),
            'footer': request.form.get('footer')
        }

        image = request.files.get('image')
        if image:
            image_path = os.path.join(UPLOAD_FOLDER, image.filename)
            image.save(image_path)
            updates['image'] = image_path

        result = edit_post(post_id, updates)

        if "not found" in result:
            return jsonify(error=result), 404
        elif "No fields" in result:
            return jsonify(error=result), 400
        else:
            return jsonify(message=result), 200

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)


    @app.route('/delete/<int:post_id>', methods=['DELETE'])
    def delete_post_route(post_id):
        if not session.get('logged_in'):
            return jsonify(error="Unauthorized"), 401

        deleted = delete_post(post_id)
        return deleted

    @app.route('/get-posts', methods=['GET'])
    def return_posts():
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=5, type=int)
        offset = (page - 1) * limit
        post_list = get_posts(offset, limit)
        return jsonify(posts=post_list)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)