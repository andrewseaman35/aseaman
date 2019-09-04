import importlib
import json

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

# from whisky_shelf import lambda_handler as whisky_api

app = Flask(__name__)
CORS(app)


def make_lambda_request(function_name, payload):
    handler = importlib.import_module("{}.lambda_handler".format(function_name))
    response = handler.lambda_handler(payload, None)
    return response


def convert_to_response(result):
    body = jsonify(json.loads(result['body']))
    status = result['statusCode']
    headers = result['headers']
    return make_response((body, status, headers))


def get_payload(request):
    payload = request.json or {}
    payload.update({'local': True})
    return payload


@app.route('/whisky', methods=['POST'])
def whisky():
    payload = get_payload(request)
    result = make_lambda_request('whisky_shelf', payload)
    return convert_to_response(result)


@app.route('/state_check', methods=['POST'])
def state_check():
    payload = get_payload(request)
    result = make_lambda_request('state_check', payload)
    return convert_to_response(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8099)
