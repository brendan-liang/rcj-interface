import websocket
import json

conn = websocket.create_connection("ws://127.0.0.1:8765")

conn.send(json.dumps({"message": "register"}))