import { useContext, useEffect } from "react"
import { UserContext } from "../App";
import { robotManager } from "./robots"

function handleNewSelect(event) {
    const selectElement = event.target;
    console.log(selectElement.value);
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

function CameraFeed() {
    const { robots, lastImage, setLastImage, selectedBot, setSelectedBot } = useContext(UserContext);
    
    // Update image
    useEffect(() => {
        const updateImage = (id, message) => {
            if (!message) { return ;}
            const data = JSON.parse(message.data);
            if (data.message === "image") {
                setLastImage(data.data);
            } else {
                return;
            }
        };

        robotManager.on('robotMessage', updateImage);

        updateImage()

        return () => {
            robotManager.off('robotMessage', updateImage);
        };
    }, []);

    const imageElement = lastImage ? <img src={`data:image/jpeg;base64, ${lastImage}`}></img> : <span>No image</span>;

    // Update selection
    const selectElement = SelectBot()

    return (
        <div className="CameraFeed tile">
            <h2>Camera Feed</h2>
            {selectElement}
            {imageElement}
        </div>
    );
}

export { CameraFeed }