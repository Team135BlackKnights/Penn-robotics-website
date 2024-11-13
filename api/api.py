import json
import logging
from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from logging import FileHandler
import os

SCHOOL_FILE = 'school_name.json'

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

def get_school_name():
    try:
        with open(SCHOOL_FILE, 'r') as file:
            data = json.load(file)
            return data.get('school_name', 'Default School Name')
    except FileNotFoundError:
        api_logger.warning(f"{SCHOOL_FILE} not found. Returning default school name.")
        return 'Default School Name'

# Function to update the school name in the file
def update_school_name(new_name):
    with open(SCHOOL_FILE, 'w') as file:
        json.dump({'school_name': new_name}, file)
    api_logger.info(f"School name updated to: {new_name}")

# Create and configure the Flask app
def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable Cross-Origin Resource Sharing

    # Error handler for rate limiting or other common errors
    @app.errorhandler(429)
    def rate_limit_handler(e):
        return jsonify(error="Too many requests. You are being rate limited."), 429

    @app.errorhandler(500)
    def internal_server_error(e):
        api_logger.error(f"Internal server error: {e}")
        return jsonify(error="An unexpected error occurred. Please try again later."), 500

    # Home route
    @app.route('/', methods=['GET'])
    def home():
        return "Hello, World! This is the School API. Welcome!"

    # Get school name route
    @app.route('/api/school-name', methods=['GET'])
    def get_school_name_route():
        school_name = get_school_name()
        return jsonify({'school_name': school_name})

    # Update school name route
    @app.route('/api/update-school-name', methods=['POST'])
    def update_school_name_route():
        data = request.get_json()
        new_school_name = data.get('school_name')
        
        if new_school_name:
            update_school_name(new_school_name)
            return jsonify({'message': 'School name updated successfully!'}), 200
        else:
            return jsonify({'message': 'No school name provided!'}), 400

    return app

# Run the app
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, use_reloader=False)
