from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/do-something', methods=['GET'])
def do_something():
    response = {
        'message': 'Hello! You requested to do something!'
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
