import argparse
import importlib
import json

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


def make_lambda_request(function_name, payload, context):
    handler = importlib.import_module("{}.lambda_handler".format(function_name))
    response = handler.lambda_handler(payload, context)
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

def get_curl_payload(request):
    string_payload = json.loads(request.data)
    payload = {
        'action': string_payload['action'],
        'payload': json.loads(string_payload['payload']),
        'local': True,
    }
    return payload

@app.route('/mame_highscore', methods=['POST'])
def mame_highscore():
    try:
        payload = get_payload(request)
        payload['payload'].get
    except:
        payload = get_curl_payload(request)
    result = make_lambda_request('mame_highscore', payload, None)
    return convert_to_response(result)

@app.route('/whisky', methods=['POST'])
def whisky():
    payload = get_payload(request)
    result = make_lambda_request('whisky_shelf', payload, None)
    return convert_to_response(result)


@app.route('/state_check', methods=['POST'])
def state_check():
    payload = get_payload(request)
    result = make_lambda_request('state_check', payload, None)
    return convert_to_response(result)


@app.route('/draw_jasper', methods=['POST'])
def draw_jasper():
    payload = get_payload(request)
    result = make_lambda_request('draw_jasper', payload, None)
    return convert_to_response(result)


@app.route('/salt_level', methods=['POST'])
def salt_level():
    payload = get_payload(request)
    result = make_lambda_request('salt_level', payload, None)
    return convert_to_response(result)


@app.route('/compare_acnh', methods=['POST'])
def compare_acnh():
    payload = get_payload(request)
    result = make_lambda_request('compare_acnh', payload, None)
    return convert_to_response(result)


@app.route('/chess', methods=['POST'])
def chess():
    payload = get_payload(request)
    result = make_lambda_request('chess', payload, None)
    return convert_to_response(result)


def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", metavar='N', default=8099)
    return parser.parse_args()


if __name__ == '__main__':
    args = get_args()
    app.run(host='0.0.0.0', port=args.port)
