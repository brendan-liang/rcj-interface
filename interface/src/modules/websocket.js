class RobotWebSocket {
    constructor(url, openCallback=null, closeCallback=null, messageCallback=null, pending=true) {
        this.url = url;
        this.ws = new WebSocket(url);
        this.openCallback = openCallback;
        this.closeCallback = closeCallback;
        this.messageCallback = messageCallback;

        this.pending = pending;

        // Register on open
        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                "message": "register"
            }));
            
            this.openCallback && this.openCallback();
        };

        // Handle close
        this.ws.onclose = () => {
            this.closeCallback && this.closeCallback();
        };

        this.ws.onmessage = (data) => {
            // Check for registration message
            if (this.pending) {
                const msg = JSON.parse(data.data);
                if (msg.message === "register") {
                    this.pending = false;
                    console.log(`Registered with server: ${msg.data}`);
                    return;
                }
            }
            // Handle normal messages
            this.messageCallback && this.messageCallback(data);
        };
    }

    close() {
        this.ws.close();
        return true;
    }
}

class RobotManager {
    constructor() {
        this.robots = {};
        this._listeners = {};
    }
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = new Set();
        }
        this._listeners[event].add(callback);
    }

    off(event, callback) {
        if (this._listeners[event]) {
            this._listeners[event].delete(callback);
        }
    }

    _emit(event, ...args) {
        if (this._listeners[event]) {
            for (const cb of this._listeners[event]) {
                cb(...args);
            }
        }
    }

    _assignID() {
        const existingIDs = Object.keys(this.robots)
        if (existingIDs.length === 0) {
            return 0;
        }
        return Math.max(...existingIDs) + 1;
    }

    _handleRobotMessage(id, message) {

    }

    addRobot(url) {
        const id = this._assignID();
        const robot = new RobotWebSocket(url, () => {
            console.log(`Robot ${id} connected`);
            this._emit("robotOpen", id)
        }, () => {
            console.log(`Robot ${id} disconnected`);
            delete this.robots[id];
            this._emit("robotClose", id);
            this._emit("robotsUpdated", Array.from(Object.keys(this.robots)));
        }, (message) => {
            this._emit("robotMessage", id, message);
        });

        this.robots[id] = robot;
        this._emit('robotsUpdated', Array.from(Object.keys(this.robots)));
    }

    removeRobot(id) {
        const robot = this.robots.get(id);
        if (robot) {
            robot.close();
            this.robots.delete(id);
            this._emit('robotsUpdated', Array.from(Object.keys(this.robots)));
        }
    }
}

export { RobotManager };