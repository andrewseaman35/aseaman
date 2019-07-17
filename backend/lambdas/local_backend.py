import importlib
import json

from flask import Flask, request, jsonify
from flask_cors import CORS

# from whisky_shelf import lambda_handler as whisky_api

app = Flask(__name__)
CORS(app)


def make_lambda_request(function_name, payload):
    handler = importlib.import_module("{}.lambda_handler".format(function_name))
    response = handler.lambda_handler(payload, None)
    return response


def make_response(result):
    return jsonify(json.loads(result['body']))


def get_payload(request):
    payload = request.json or {}
    payload.update({'local': True})
    return payload


@app.route('/whisky', methods=['POST'])
def whisky():
    payload = get_payload(request)
    result = make_lambda_request('whisky_shelf', payload)
    return make_response(result)


@app.route('/state_check', methods=['POST'])
def state_check():
    payload = get_payload(request)
    result = make_lambda_request('state_check', payload)
    return make_response(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8099)
