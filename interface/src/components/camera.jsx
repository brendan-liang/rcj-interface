import { useContext, useEffect } from "react"
import { UserContext } from "../App.jsx";
import { robotManager } from "./robots.jsx"

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

    const imageElement = lastImage ? <img src={`data:image/jpeg;base64, ${lastImage}`} className="RobotImage"></img> : <span>No image</span>;

    return (
        <div className="CameraFeed tile">
            <h2>Camera Feed</h2>
            {imageElement}
        </div>
    );
}

export { CameraFeed }