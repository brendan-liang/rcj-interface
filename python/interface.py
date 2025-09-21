from websockets.sync.server import serve 
import json
import threading

class WSServer:
    def __init__(self, host='localhost', port=8765):
        self.host = host
        self.port = port
        self.clients = set()

    def register_client(self, websocket):
        self.clients.add(websocket)
        print(f"Client connected. Total clients: {len(self.clients)}")

    def unregister_client(self, websocket):
        self.clients.remove(websocket)
        print(f"Client disconnected. Total clients: {len(self.clients)}")

    def broadcast(self, message):
        if self.clients:
            for client in self.clients:
                client.send(message)

    def send_frame(self, frame):
        ret, buffer = cv2.imencode('.jpg', frame)

        if ret:
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            message = json.dumps({"message": "image", "data": frame_base64})
            self.broadcast(message)
    
    def handle_message(self, websocket, message):
        try:
            data = json.loads(message)
            print(f"Received: {data}")
            
            # Echo the message back to the sender
            response = {"message": "echo", "data": data}
            websocket.send(json.dumps(response))
            
        except json.JSONDecodeError:
            websocket.send(json.dumps({"message":"error", "error": "Invalid JSON"}))

    def client_handler(self, websocket):
        self.register_client(websocket)
        try:
            for message in websocket:
                self.handle_message(websocket, message)
        # except websockets.exceptions.ConnectionClosed:
        #     pass
        finally:
            self.unregister_client(websocket)

    def _start_server(self):
        print(f"Starting WebSocket server on ws://{self.host}:{self.port}")
        with serve(self.client_handler, self.host, self.port) as server:
            server.serve_forever()
        

    def run(self):
        self.run_thread = threading.Thread(target=self._start_server, daemon=True)
        self.run_thread.start()

if __name__ == "__main__":
    import cv2
    import base64

    server = WSServer()
    server.run()
    print("Running server, starting camera...")

    # Encode frame as JPEG and convert to base64
    camera = cv2.VideoCapture(0)

    # Set camera resolution to lower values for better performance
    # camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    # camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    # camera.set(cv2.CAP_PROP_FPS, 30)

    while 1:
        cv2.waitKey(1)
        ret, frame = camera.read()
        
        if ret:
            server.send_frame(frame)
        
        cv2.imshow("interface test", frame)