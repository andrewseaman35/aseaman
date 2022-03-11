import http.server
import sys

directory = str(sys.argv[1])
port = int(sys.argv[2])


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {"": "text/plain"}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)


def run(server_class=http.server.HTTPServer, handler_class=Handler):
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()


run()
