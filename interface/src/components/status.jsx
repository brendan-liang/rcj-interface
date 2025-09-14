import { useContext, useEffect } from "react"
import { UserContext } from "../App.jsx"

function handleNewSelect() {

}

function SelectBot() {
    const { robots, lastImage, setLastImage, selectedBot, setSelectedBot } = useContext(UserContext);

    return (
        <div className="SelectBot">
            <span>Select Bot: </span>
            <select id="robot-select" onChange={handleNewSelect} value={selectedBot}>
                <option value="">None</option>
                {Object.keys(robots).map((robotKey) => (
                    <option key={robotKey} value={robotKey}>Bot {robotKey} @ {robots[robotKey].url.slice(5)}</option>
                ))}
            </select>
        </div>
    )
}

function Status() {
    const { robots, lastImage, setLastImage, selectedBot, setSelectedBot } = useContext(UserContext);

    return (
        <div className="Status tile">
            <h2>Status</h2>
            <SelectBot />
        </div>
    )
}

export { Status }