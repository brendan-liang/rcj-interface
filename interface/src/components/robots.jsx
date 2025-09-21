import { RobotManager } from "../modules/websocket"
import { useEffect, useContext } from 'react';
import { UserContext } from "../App.jsx"

const robotManager = new RobotManager();

function handleAddRobot(event) {
    event.preventDefault();
    const inputRobot = event.target.parentElement.robotName.value;
    robotManager.addRobot(`ws://${inputRobot}:8765`)
}

function RobotList() {
    const {robots, setRobots, selectedBot} = useContext(UserContext);

    useEffect(() => {
        const updateList = () => {
            console.log("updated")
            setRobots({...robotManager.robots});
        };
        
        // List of bots
        robotManager.on('robotsUpdated', updateList);
        
        updateList();
        
        return () => {
            robotManager.off('robotsUpdated', updateList);
        };
    
    }, []);

    return (
        <div className="RobotList tile">
            <h2>🤖 Connected Robots</h2>
            <ul>
                {Object.keys(robots).map((robotKey) => (
                    <li key={robotKey}>Bot {robotKey} @ {robots[robotKey].url.slice(5)}</li>
                ))}
            </ul>
            <div className="AddRobot">
                <form>
                    <span>Add New Robot</span>
                    <input type="text" placeholder="Enter robot IP address" name="robotName" autoComplete="off"/>
                    <button type="submit" onClick={handleAddRobot}>Connect Robot</button>
                </form>
            </div>
        </div>
    );
}

export { RobotList, robotManager };