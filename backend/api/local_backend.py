import argparse
import importlib
import json

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.exceptions import Unauthorized


app = Flask(__name__)
CORS(app)


def _assert_has_authorization(request):
    if not request.headers.get("Authorization"):
        raise Unauthorized()


def _build_lambda_event(request, payload):
    event = json.load(open("/aseaman/payloads/aws_proxy_event.json"))
    event = {**event, **payload}
    event["httpMethod"] = request.method
    event["path"] = request.path
    event["headers"].update(request.headers)

    return event


def make_lambda_request(function_name, request, payload, context):
    event = _build_lambda_event(request, payload)
    handler = importlib.import_module("{}.lambda_handler".format(function_name))
    response = handler.lambda_handler(event, context)
    return response


def convert_to_response(result):
    body = jsonify(json.loads(result["body"]))
    status = result["statusCode"]
    headers = result["headers"]
    return make_response((body, status, headers))


def get_payload(request):
    payload = {}
    if request.method in {"GET", "DELETE"}:
        payload.update(
            {
                "queryStringParameters": {
                    **request.args,
                },
            }
        )
    else:
        payload.update(
            {
                "body": json.dumps(
                    {
                        **request.json,
                    }
                )
            }
        )
    return payload


@app.route("/mame_highscore/<resource>/", methods=["GET", "POST"])
@app.route("/mame_highscore/", methods=["GET", "POST"], defaults={"resource": None})
def mame_highscore(resource):
    payload = get_payload(request)
    result = make_lambda_request("mame_highscore", request, payload, None)
    return convert_to_response(result)


@app.route("/whisky/", methods=["GET", "POST"])
def whisky():
    if request.method == "POST":
        _assert_has_authorization(request)
    payload = get_payload(request)
    result = make_lambda_request("whisky_shelf", request, payload, None)
    return convert_to_response(result)


@app.route("/state_check/", methods=["GET", "POST"])
def state_check():
    payload = get_payload(request)
    result = make_lambda_request("state_check", request, payload, None)
    return convert_to_response(result)


@app.route("/draw_jasper/", methods=["POST"])
def draw_jasper():
    payload = get_payload(request)
    result = make_lambda_request("draw_jasper", request, payload, None)
    return convert_to_response(result)


@app.route("/salt_level/", methods=["GET", "POST"])
def salt_level():
    payload = get_payload(request)
    result = make_lambda_request("salt_level", request, payload, None)
    return convert_to_response(result)


@app.route("/compare_acnh/", methods=["GET", "POST"], defaults={"resource": None})
@app.route("/compare_acnh/<resource>/", methods=["GET", "POST"])
def compare_acnh(resource):
    payload = get_payload(request)
    result = make_lambda_request("compare_acnh", request, payload, None)
    return convert_to_response(result)


@app.route("/chess/", methods=["GET", "POST"], defaults={"resource": None})
@app.route("/chess/<resource>/", methods=["GET", "POST"])
def chess(resource):
    payload = get_payload(request)
    result = make_lambda_request("chess", request, payload, None)
    return convert_to_response(result)


@app.route("/linker/", methods=["GET", "POST", "PUT"])
def linker():
    payload = get_payload(request)
    result = make_lambda_request("linker", request, payload, None)
    return convert_to_response(result)


def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", metavar="N", default=8099)
    return parser.parse_args()


if __name__ == "__main__":
    args = get_args()
    app.run(host="0.0.0.0", debug=True, port=args.port)
