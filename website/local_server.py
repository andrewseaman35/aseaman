import http.server
import sys

directory = str(sys.argv[1])
port = int(sys.argv[2])


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self):
        self.send_my_headers()
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")


Handler.extensions_map[""] = "text/html"


def run(server_class=http.server.HTTPServer, handler_class=Handler):
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()


run()
