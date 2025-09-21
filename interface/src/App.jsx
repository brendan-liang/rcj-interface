import './App.css'
import { RobotList } from "./components/robots"
import { CameraFeed } from "./components/camera"
import { ControlTile } from "./components/control"
import { Status } from "./components/status"
import { Visualiser } from "./components/visualiser"
import { useState } from 'react';
import React from 'react';

export const UserContext = React.createContext(null);

function App() {
    const [robots, setRobots] = useState({});
    const [lastImage, setLastImage] = useState(null);
    const [selectedBot, setSelectedBot] = useState("");

    return (
        <div className="App">
            <UserContext.Provider value={{
                robots, setRobots, 
                lastImage, setLastImage,
                selectedBot, setSelectedBot,
            }}>
                <RobotList />
                <CameraFeed />
                <ControlTile />
                <Status />
                <Visualiser />
            </UserContext.Provider>
        </div>
    );
}

export default App;