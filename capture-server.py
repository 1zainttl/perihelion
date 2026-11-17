#!/usr/bin/env python3
"""Static server for the game + a /save endpoint that stores canvas captures
POSTed by the in-page devshot helper as {name, data} JSON (data = dataURL)."""
import base64
import json
import http.server
import pathlib
import socketserver

ROOT = pathlib.Path(__file__).resolve().parent
GAME = ROOT / "game"
OUT = ROOT / "screenshots"
OUT.mkdir(exist_ok=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(GAME), **kw)

    def do_POST(self):
        if self.path != "/save":
            self.send_error(404)
            return
        body = self.rfile.read(int(self.headers["Content-Length"]))
        payload = json.loads(body)
        name = "".join(c for c in payload["name"] if c.isalnum() or c in "-_")
        data_url = payload["data"]
        header, b64 = data_url.split(",", 1)
        ext = "jpg" if "jpeg" in header else "png"
        path = OUT / f"{name}.{ext}"
        path.write_bytes(base64.b64decode(b64))
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"saved": str(path), "bytes": path.stat().st_size}).encode())

    def log_message(self, *a):
        pass


with socketserver.TCPServer(("127.0.0.1", 8765), Handler) as srv:
    srv.allow_reuse_address = True
    srv.serve_forever()
