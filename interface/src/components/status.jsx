import { useContext, useEffect } from "react"
import { UserContext } from "../App.jsx"

function handleNewSelect(e) {
    console.log(e.target.value);
}

function SelectBot() {
    const { robots, lastImage, setLastImage, selectedBot, setSelectedBot } = useContext(UserContext);

    return (
        <div className="SelectBot">
            <span>Select Active Robot</span>
            <select id="robot-select" onChange={handleNewSelect}>
                <option value="">Choose a robot...</option>
                {Object.keys(robots).map((robotKey) => (
                    <option key={robotKey} value={robotKey}>🤖 Bot {robotKey} @ {robots[robotKey].url.slice(5)}</option>
                ))}
            </select>
        </div>
    )
}

function Status() {
    const { robots, lastImage, setLastImage, selectedBot, setSelectedBot } = useContext(UserContext);

    return (
        <div className="Status tile">
            <h2>⚡ Status & Settings</h2>
            <SelectBot />
            <div className="status-info">
                <div className="status-indicator">
                    <div className={`status-dot ${Object.keys(robots).length > 0 ? 'status-dot-connected' : 'status-dot-disconnected'}`}></div>
                    <span className="status-text">
                        {Object.keys(robots).length} robot(s) connected
                    </span>
                </div>
                <div className="status-indicator">
                    <div className={`status-dot ${selectedBot ? 'status-dot-active' : 'status-dot-disconnected'}`}></div>
                    <span className="status-text">
                        {selectedBot ? `Bot ${selectedBot} active` : 'No robot selected'}
                    </span>
                </div>
            </div>
        </div>
    )
}

export { Status }