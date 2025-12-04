import json
import logging
from flask import Flask, jsonify, request, redirect, send_file
from flask_cors import CORS
import os
from logging import FileHandler
import sqlite3
from flask import make_response
from datetime import datetime, timezone
from werkzeug.utils import secure_filename
import uuid

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
    CORS(app, origins=["https://pennrobotics.org", "http://127.0.0.1:5500"], supports_credentials=True)
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
        return "Penn High School Robotics Website API."
    @app.route('/check-login', methods=['GET'])
    def check_login():
        api_logger.info(f"/check-login called from {request.remote_addr}; session keys={list(session.keys())}")
        if 'logged_in' in session and session['logged_in']:
            # Check if login_time is present and within the valid timeframe
            if 'login_time' in session:
                try:
                    login_time = datetime.fromisoformat(session['login_time'])
                except Exception:
                    session['logged_in'] = False
                    return jsonify(logged_in=False)
                if (datetime.now(timezone.utc) - login_time) < timedelta(minutes=30):
                    return jsonify(logged_in=True)
                else:
                    session['logged_in'] = False
                    return jsonify(logged_in=False)
            
        else:
            return jsonify(logged_in=False)
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        api_logger.info(f"/login attempt for username={username} from {request.remote_addr}")
        # Check credentials (AUTH_USER and AUTH_TOKEN)
        if username == AUTH_USER and password == AUTH_TOKEN:
            session['logged_in'] = True  # Set session
            # store ISO formatted time so it's JSON-serializable in session
            session['login_time'] = datetime.now(timezone.utc).isoformat()
            return jsonify(message="Accepted"), 200  # Successful login message
        else:
            return jsonify(error="Invalid credentials"), 401  # Unauthorized
        
    @app.route('/make-post', methods=['POST'])
    def make_post():
        api_logger.info(f"/make-post called from {request.remote_addr}")
        if not session.get('logged_in'):
            api_logger.info("/make-post unauthorized: not logged in")
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

        api_logger.info(f"/get-post called for id={post_id} from {request.remote_addr}")
        if not post:
            api_logger.info(f"/get-post: post id={post_id} not found")
            return jsonify(error="Post not found"), 404
        api_logger.info(f"/get-post: returning post id={post_id}")
        return jsonify(post), 200
    @app.route('/edit-post', methods=['POST'])
    def edit_post_api():
        api_logger.info(f"/edit-post called from {request.remote_addr}")
        if not session.get('logged_in'):
            api_logger.info("/edit-post unauthorized: not logged in")
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

    # Helper: load image keys JSON
    def load_image_keys():
        try:
            keys_path = os.path.join(current_directory, 'image_keys.json')
            api_logger.info(f"Loading image keys from {keys_path}")
            with open(keys_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            api_logger.info(f"Loaded {len(data.keys()) if isinstance(data, dict) else 'N/A'} image keys")
            return data
        except Exception as e:
            api_logger.error(f"Error loading image_keys.json: {e}")
            return {}

    @app.route('/image-keys', methods=['GET'])
    def image_keys():
        api_logger.info(f"/image-keys requested from {request.remote_addr}")
        keys = load_image_keys()
        api_logger.info(f"/image-keys returning {len(keys.keys()) if isinstance(keys, dict) else 'N/A'} keys")
        return jsonify(keys)


    @app.route('/upload-image', methods=['POST'])
    def upload_image():
        api_logger.info(f"/upload-image called from {request.remote_addr}")
        if not session.get('logged_in'):
            api_logger.info("/upload-image unauthorized: not logged in")
            return jsonify(error="Unauthorized"), 401

        key = request.form.get('key') or request.args.get('key')
        image = request.files.get('image')

        api_logger.info(f"/upload-image params: key={key}, image_present={bool(image)}")

        if not key:
            api_logger.info("/upload-image missing key")
            return jsonify(error="Missing 'key' field"), 400
        keys = load_image_keys()
        if key not in keys:
            api_logger.info(f"/upload-image unknown key: {key}")
            return jsonify(error="Unknown key"), 400

        if not image:
            api_logger.info("/upload-image missing file")
            return jsonify(error="No image file provided"), 400

        # validation
        meta = keys.get(key, {})
        allowed = meta.get('allowed', ["image/png", "image/jpeg", "image/webp"]) 
        max_size = meta.get('max_size', 5 * 1024 * 1024)

        try:
            file_bytes = image.read()
            size = len(file_bytes)
            api_logger.info(f"/upload-image file size={size} bytes; max_size={max_size}")
            if size > max_size:
                api_logger.info("/upload-image file too large")
                return jsonify(error=f"File too large (max {max_size} bytes)"), 400
            mimetype = image.mimetype or 'application/octet-stream'
            api_logger.info(f"/upload-image mimetype={mimetype}")
            if allowed and mimetype not in allowed:
                api_logger.info(f"/upload-image invalid mime: {mimetype}")
                return jsonify(error=f"Invalid file type: {mimetype}"), 400

            filename = secure_filename(image.filename)
            if not filename:
                api_logger.info("/upload-image invalid filename after secure_filename")
                return jsonify(error="Invalid filename"), 400
            unique_name = f"{uuid.uuid4().hex}_{filename}"
            save_path = os.path.join(UPLOAD_FOLDER, unique_name)
            with open(save_path, 'wb') as f:
                f.write(file_bytes)

            api_logger.info(f"/upload-image saved file to {save_path}")

            # store mapping in DB
            version = set_image_mapping(key, save_path, mimetype)
            api_logger.info(f"/upload-image updated DB mapping for key={key} with version={version}")

            # build returned URL (frontend dev server for local hosts)
            host = request.host or ''
            if host.startswith('127.0.0.1') or host.startswith('localhost'):
                url = f"http://127.0.0.1:5500/uploads/{unique_name}"
            else:
                url = request.host_url.rstrip('/') + f"/uploads/{unique_name}"

            api_logger.info(f"Image uploaded for key={key}: {save_path} -> {url}")
            return jsonify(url=url, key=key, version=version), 201
        except Exception as e:
            api_logger.error(f"Error saving uploaded image: {e}")
            return jsonify(error=str(e)), 500


    @app.route('/get-image', methods=['GET'])
    def get_image():
        key = request.args.get('key')
        api_logger.info(f"/get-image called from {request.remote_addr} with key={key}")
        if not key:
            api_logger.info("/get-image missing key param")
            return jsonify(error="Missing 'key' param"), 400
        keys = load_image_keys()
        if key not in keys:
            api_logger.info(f"/get-image unknown key: {key}")
            return jsonify(error="Unknown key"), 400

        mapping = get_image_mapping(key)
        if mapping:
            filename = os.path.basename(mapping['filename'])
            host = request.host or ''
            if host.startswith('127.0.0.1') or host.startswith('localhost'):
                url = f"http://127.0.0.1:5500/uploads/{filename}"
            else:
                url = request.host_url.rstrip('/') + f"/uploads/{filename}"
            # append version for cache-busting
            v = mapping.get('version')
            if v:
                url = f"{url}?v={v}"
            api_logger.info(f"/get-image returning mapped url for key={key}: {url} (version={v})")
            return jsonify(url=url, key=key, version=v)

        # fallback to default defined in JSON
        meta = keys.get(key, {})
        default = meta.get('default')
        api_logger.info(f"/get-image no mapping for key={key}; default defined as: {default}")
        if not default:
            api_logger.info(f"/get-image no default available for key={key}")
            return jsonify(error="No image mapping or default available"), 404

        # If default is a relative path, convert to absolute URL depending on environment
        if isinstance(default, str):
            url = default
            if default.startswith('http://') or default.startswith('https://'):
                url = default
            elif default.startswith('/'):
                host = request.host or ''
                if host.startswith('127.0.0.1') or host.startswith('localhost'):
                    url = f"http://127.0.0.1:5500{default}"
                else:
                    url = request.host_url.rstrip('/') + default
            else:
                # relative path without leading slash; treat as relative to web root
                host = request.host or ''
                if host.startswith('127.0.0.1') or host.startswith('localhost'):
                    url = f"http://127.0.0.1:5500/{default}"
                else:
                    url = request.host_url.rstrip('/') + f"/{default}"

            api_logger.info(f"/get-image returning default url for key={key}: {url}")
            return jsonify(url=url, key=key, version=None)
        else:
            api_logger.info(f"/get-image unexpected default type for key={key}: {type(default)}")
            return jsonify(error="Invalid default image configuration"), 500


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
    
    @app.route('/get-logs', methods=['GET'])
    def get_logs():
        if not session.get('logged_in'):
            return jsonify(error="Unauthorized"), 401

        try:
            with open(log_file_path, 'r') as log_file:
                logs = log_file.readlines()
            return jsonify(logs=logs)
        except Exception as e:
            return jsonify(error=f"Error reading logs: {str(e)}"), 500

    @app.route('/download-logs', methods=['GET'])
    def download_logs():
        if not session.get('logged_in'):
            return jsonify(error="Unauthorized"), 401

        try:
            return send_file(log_file_path, as_attachment=True)
        except Exception as e:
            return jsonify(error=f"Error downloading logs: {str(e)}"), 500


    @app.route('/reset-logs', methods=['POST'])
    def reset_logs():
        if not session.get('logged_in'):
            return jsonify(error="Unauthorized"), 401

        try:
            open(log_file_path, 'w').close()  # Clears the log file
            return jsonify(message="Logs have been reset.")
        except Exception as e:
            return jsonify(error=f"Error resetting logs: {str(e)}"), 500

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)