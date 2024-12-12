import json
import logging
from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
import os
from logging import FileHandler
import sqlite3
import sys
from databaseMain import *
from auth import *

current_directory = os.path.dirname(__file__)
log_file_path = os.path.join(current_directory, 'api.log')

api_logger = logging.getLogger('api_logger')
api_logger.setLevel(logging.INFO)

api_handler = FileHandler(log_file_path)
api_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
api_handler.setFormatter(api_formatter)
api_logger.addHandler(api_handler)

app = Flask(__name__)
CORS(app)

flask_logger = logging.getLogger('werkzeug')
flask_logger.setLevel(logging.INFO)
flask_logger.addHandler(api_handler)

flask_logger.propagate = False



def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.errorhandler(429)
    def rate_limit_handler(e):
        return jsonify(error="Too many requests. You are being rate limited."), 429

    @app.errorhandler(500)
    def internal_server_error(e):
        api_logger.error(f"Internal server error: {e}")
        return jsonify(error="An unexpected error occurred. Please try again later."), 500

    @app.route('/', methods=['GET'])
    def home():
        return "Hello, World! This is the School API. Welcome!"
    
    @app.route('/post-la-post', methods=['POST'])
    def make_post():
        auth_header = request.headers.get('Authorization')

        if not auth_header or auth_header != f"Bearer {AUTH_TOKEN}":
            return jsonify(error="Unauthorized"), 401

        data = request.get_json()

        title = data.get('title')
        content = data.get('content')
        date = data.get('date', None)
        author = data.get('author', None)
        footer = data.get('footer', None)
        image = data.get('image', None)
        file = data.get('file', None)
        video = data.get('video', None)

        make_a_post(title, content, date, author, footer, image, file, video)

        return jsonify(message="Post created successfully."), 201        
    
    @app.route('/get-posts', methods=['GET'])
    def return_posts():
        post_list = get_posts()
        return jsonify(posts=post_list)

    return app
        


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, use_reloader=False)

    

