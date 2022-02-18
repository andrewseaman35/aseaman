import argparse
import importlib
import json

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


def _build_lambda_event(payload, **kwargs):
    base_event = json.load(open('/aseaman/payloads/aws_proxy_event.json'))
    return {
        **base_event,
        **payload,
        **kwargs,
    }


def make_lambda_request(function_name, method, payload, context):
    base_event = _build_lambda_event(
        payload,
        httpMethod=method,
    )
    print("== EVENT ==")
    print(base_event)
    handler = importlib.import_module("{}.lambda_handler".format(function_name))
    response = handler.lambda_handler(base_event, context)
    return response


def convert_to_response(result):
    body = jsonify(json.loads(result['body']))
    status = result['statusCode']
    headers = result['headers']
    return make_response((body, status, headers))


def get_payload(request):
    print(request.method)
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
    print("== PAYLOAD ==")
    print(payload)
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
    result = make_lambda_request('mame_highscore', request.method, payload, None)
    return convert_to_response(result)

@app.route('/whisky', methods=['POST'])
def whisky():
    payload = get_payload(request)
    result = make_lambda_request('whisky_shelf', request.method, payload, None)
    return convert_to_response(result)


@app.route('/state_check', methods=['POST'])
def state_check():
    payload = get_payload(request)
    result = make_lambda_request('state_check', request.method, payload, None)
    return convert_to_response(result)


@app.route('/draw_jasper', methods=['POST'])
def draw_jasper():
    payload = get_payload(request)
    result = make_lambda_request('draw_jasper', request.method, payload, None)
    return convert_to_response(result)


@app.route('/salt_level', methods=['GET', 'POST'])
def salt_level():
    payload = get_payload(request)
    result = make_lambda_request('salt_level', request.method, payload, None)
    return convert_to_response(result)


@app.route('/compare_acnh', methods=['POST'])
def compare_acnh():
    payload = get_payload(request)
    result = make_lambda_request('compare_acnh', request.method, payload, None)
    return convert_to_response(result)


@app.route('/chess', methods=['POST'])
def chess():
    payload = get_payload(request)
    result = make_lambda_request('chess', request.method, payload, None)
    return convert_to_response(result)


def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", metavar='N', default=8099)
    return parser.parse_args()


if __name__ == '__main__':
    args = get_args()
    app.run(host='0.0.0.0', debug=True, port=args.port)
