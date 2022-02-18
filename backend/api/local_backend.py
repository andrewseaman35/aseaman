import argparse
import importlib
import json

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


def _build_lambda_event(request, payload):
    event = json.load(open('/aseaman/payloads/aws_proxy_event.json'))
    event = {**event, **payload}
    event['httpMethod'] = request.method
    event['path'] = request.path

    return event


def make_lambda_request(function_name, request, payload, context):
    event = _build_lambda_event(request, payload)
    handler = importlib.import_module("{}.lambda_handler".format(function_name))
    response = handler.lambda_handler(event, context)
    return response


def convert_to_response(result):
    body = jsonify(json.loads(result['body']))
    status = result['statusCode']
    headers = result['headers']
    return make_response((body, status, headers))


def get_payload(request):
    payload = {}
    if request.method == 'GET':
        payload.update({
            'queryStringParameters': {
                **request.args,
                'local': True,
            },
        })
    else:
        payload.update({
            'body': json.dumps({
                **request.json,
                'local': True,
            })
        })
    return payload

def get_curl_payload(request):
    string_payload = json.loads(request.data)
    payload = {
        'action': string_payload['action'],
        'payload': json.loads(string_payload['payload']),
        'local': True,
    }
    return payload

@app.route('/mame_highscore/', methods=['POST'])
def mame_highscore():
    try:
        payload = get_payload(request)
        payload['payload'].get
    except:
        payload = get_curl_payload(request)
    result = make_lambda_request('mame_highscore', request, payload, None)
    return convert_to_response(result)

@app.route('/whisky/', methods=['GET', 'POST'])
def whisky():
    payload = get_payload(request)
    result = make_lambda_request('whisky_shelf', request, payload, None)
    return convert_to_response(result)


@app.route('/state_check/', methods=['POST'])
def state_check():
    payload = get_payload(request)
    result = make_lambda_request('state_check', request, payload, None)
    return convert_to_response(result)


@app.route('/draw_jasper/', methods=['POST'])
def draw_jasper():
    payload = get_payload(request)
    result = make_lambda_request('draw_jasper', request, payload, None)
    return convert_to_response(result)


@app.route('/salt_level/', methods=['GET', 'POST'])
def salt_level():
    print(request)
    payload = get_payload(request)
    result = make_lambda_request('salt_level', request, payload, None)
    return convert_to_response(result)


@app.route('/compare_acnh/', methods=['POST'])
def compare_acnh():
    payload = get_payload(request)
    result = make_lambda_request('compare_acnh', request, payload, None)
    return convert_to_response(result)


@app.route('/chess/', methods=['POST'])
def chess():
    payload = get_payload(request)
    result = make_lambda_request('chess', request, payload, None)
    return convert_to_response(result)


def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", metavar='N', default=8099)
    return parser.parse_args()


if __name__ == '__main__':
    args = get_args()
    app.run(host='0.0.0.0', debug=True, port=args.port)
