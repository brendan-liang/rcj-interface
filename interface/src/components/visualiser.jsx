import { useContext, useEffect, useState, useRef } from "react"
import { UserContext } from "../App.jsx";
import { robotManager } from "./robots.jsx";

function Visualiser() {
    const [mode, setMode] = useState('radar'); // 'radar' or 'field'
    const canvasRef = useRef(null);
    const [pointCloud, setPointCloud] = useState([]);
    const [position, setPosition] = useState({ x: 0, y: 0 }); // in mm
    const [lidarHistory, setLidarHistory] = useState([]); // Store last 5 frames

    useEffect(() => {
        // Generate some sample point cloud data for demonstration
        const updatePointCloud = (id, message) => {
            if (!message) { return ;}
            const data = JSON.parse(message.data);
            if (data.message === "lidar") {
                setPointCloud(data.data);
                // Add frame to history, keep only last 5
                setLidarHistory(prev => {
                    const newHistory = [...prev, data.data];
                    return newHistory.slice(-5); // Keep only last 5 frames
                });
            } else if (data.message === "pos") {
                setPosition({ x: data.data.x, y: data.data.y });
            } else { return ; }
        };

        robotManager.on('robotMessage', updatePointCloud);

        return () => {
            robotManager.off('robotMessage', updatePointCloud);
        };
    }, []);

    const saveLidarFrames = () => {
        if (lidarHistory.length === 0) {
            alert('No lidar frames to save!');
            return;
        }

        let content = `Lidar Data Export - ${new Date().toISOString()}\n`;
        content += `Total frames: ${lidarHistory.length}\n\n`;

        lidarHistory.forEach((frame, index) => {
            content += `Points: ${frame.length}\n`;
            content += `Format: [angle_degrees, distance_mm]\n`;
            content += `Data:\n`;
            
            frame.forEach(point => {
                content += `[${point[0]}, ${point[1]}]\n`;
            });
            
            content += `\n${'='.repeat(50)}\n\n`;
        });

        // Create and download the file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lidar_frames_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        // Set canvas size to match display size
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Clear canvas
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(0, 0, rect.width, rect.height);

        if (mode === 'radar') {
            drawRadarMode(ctx, rect.width, rect.height);
        } else {
            drawFieldMode(ctx, rect.width, rect.height);
        }
    }, [mode, pointCloud, position]);

    const drawRadarMode = (ctx, width, height) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2 - 20;
        const scale = maxRadius / 3200; // 3200mm max distance

        // Draw radar circles
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1;
        for (let r = 800; r <= 3200; r += 800) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r * scale, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw radar lines
        for (let angle = 0; angle < 360; angle += 30) {
            const rad = (angle * Math.PI) / 180;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(rad) * maxRadius,
                centerY + Math.sin(rad) * maxRadius
            );
            ctx.stroke();
        }

        // Draw center point
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw point cloud
        ctx.fillStyle = '#10b981';
        pointCloud.forEach(point => {
            const rad = ((point[0] - 90) * Math.PI) / 180;
            const x = centerX + Math.cos(rad) * point[1] * scale;
            const y = centerY + Math.sin(rad) * point[1] * scale;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw distance labels
        // ctx.font = '12px JetBrains Mono';
        // ctx.textAlign = 'center';
        // for (let r = 500; r <= 2500; r += 500) {
            //     ctx.fillText(`${r}mm`, centerX, centerY - r * scale + 4);
            // }
            
            // Draw angle labels
        ctx.fillStyle = 'rgba(203, 213, 225, 0.8)';
        ctx.textAlign = 'center';
        for (let angle = 0; angle < 360; angle += 45) {
            const rad = ((angle - 90) * Math.PI) / 180;
            const labelRadius = maxRadius - 15;
            const x = centerX + Math.cos(rad) * labelRadius;
            const y = centerY + Math.sin(rad) * labelRadius + 4;
            ctx.fillText(`${angle}°`, x, y);
        }
    };

    const drawFieldMode = (ctx, width, height) => {
        // RCJ Soccer field dimensions: 2430mm x 1820mm
        const fieldWidth = 1820;
        const fieldHeight = 2430;
        
        // Calculate scale to fit field in canvas with padding
        const padding = 40;
        const scaleX = (width - padding * 2) / fieldWidth;
        const scaleY = (height - padding * 2) / fieldHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const drawWidth = fieldWidth * scale;
        const drawHeight = fieldHeight * scale;
        const offsetX = (width - drawWidth) / 2;
        const offsetY = (height - drawHeight) / 2;

        // Draw field background (green)
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(offsetX, offsetY, drawWidth, drawHeight);

        // Out-of-bounds line dimensions
        const outOfBoundsDistance = 250 * scale;  // 250mm from wall
        const outOfBoundsThickness = 50 * scale;  // 50mm thick

        // Draw out-of-bounds lines (white)
        ctx.fillStyle = '#ffffff';
        
        // Top out-of-bounds line
        ctx.fillRect(
            offsetX + outOfBoundsDistance, 
            offsetY + outOfBoundsDistance, 
            drawWidth - (outOfBoundsDistance * 2), 
            outOfBoundsThickness
        );
        
        // Bottom out-of-bounds line
        ctx.fillRect(
            offsetX + outOfBoundsDistance, 
            offsetY + drawHeight - outOfBoundsDistance - outOfBoundsThickness, 
            drawWidth - (outOfBoundsDistance * 2), 
            outOfBoundsThickness
        );
        
        // Left out-of-bounds line
        ctx.fillRect(
            offsetX + outOfBoundsDistance, 
            offsetY + outOfBoundsDistance, 
            outOfBoundsThickness, 
            drawHeight - (outOfBoundsDistance * 2)
        );
        
        // Right out-of-bounds line
        ctx.fillRect(
            offsetX + drawWidth - outOfBoundsDistance - outOfBoundsThickness, 
            offsetY + outOfBoundsDistance, 
            outOfBoundsThickness, 
            drawHeight - (outOfBoundsDistance * 2)
        );

        // Draw field border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);

        // Draw center line
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + drawHeight / 2);
        ctx.lineTo(offsetX + drawWidth, offsetY + drawHeight / 2);
        ctx.stroke();

        // Draw center circle (300mm radius)
        const centerRadius = 300 * scale;
        ctx.beginPath();
        ctx.arc(offsetX + drawWidth / 2, offsetY + drawHeight / 2, centerRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(offsetX + drawWidth / 2, offsetY + drawHeight / 2, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Goal dimensions
        const goalWidth = 300 * scale;   // 300mm
        const goalDepth = 50 * scale;    // 50mm
        const goalOffset = (drawWidth - goalWidth) / 2;

        // Draw top goal (black outline, white fill)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX + goalOffset, offsetY - goalDepth, goalWidth, goalDepth);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX + goalOffset, offsetY - goalDepth, goalWidth, goalDepth);

        // Draw bottom goal (black outline, white fill)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX + goalOffset, offsetY + drawHeight, goalWidth, goalDepth);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX + goalOffset, offsetY + drawHeight, goalWidth, goalDepth);

        // Penalty area dimensions
        const penaltyWidth = 900 * scale;   // 900mm
        const penaltyHeight = 450 * scale;  // 450mm
        const penaltyOffset = (drawWidth - penaltyWidth) / 2;

        // Draw penalty areas (white lines)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        
        // Top penalty area
        ctx.strokeRect(offsetX + penaltyOffset, offsetY, penaltyWidth, penaltyHeight);
        
        // Bottom penalty area
        ctx.strokeRect(offsetX + penaltyOffset, offsetY + drawHeight - penaltyHeight, penaltyWidth, penaltyHeight);

        // Draw penalty dots (70mm from goal line, center of penalty area)
        const penaltyDotDistance = 70 * scale;
        ctx.fillStyle = '#ffffff';
        
        // Top penalty dot
        ctx.beginPath();
        ctx.arc(offsetX + drawWidth / 2, offsetY + penaltyDotDistance, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Bottom penalty dot
        ctx.beginPath();
        ctx.arc(offsetX + drawWidth / 2, offsetY + drawHeight - penaltyDotDistance, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Add field labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('RCJ Soccer Field', width / 2, offsetY - 10);
        ctx.fillText(`${fieldWidth}mm × ${fieldHeight}mm`, width / 2, height - 10);

        // Draw robot position
        const robotX = offsetX + (position.x + fieldWidth / 2) * scale;
        const robotY = offsetY + (fieldHeight / 2 - position.y) * scale; // Invert Y axis
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(robotX, robotY, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    return (
        <div className="Visualiser tile">
            <div className="visualiser-header">
                <h2>📊 Visualizer</h2>
                <div className="visualiser-controls">
                    <select 
                        value={mode} 
                        onChange={(e) => setMode(e.target.value)}
                    >
                        <option value="radar">🎯 Radar Mode</option>
                        <option value="field">⚽ Field Mode</option>
                    </select>
                    <button 
                        onClick={saveLidarFrames}
                        className="save-lidar-button"
                        disabled={lidarHistory.length === 0}
                    >
                        💾 Save Frames ({lidarHistory.length}/5)
                    </button>
                </div>
            </div>
            
            <canvas ref={canvasRef} />
            
            <div className="visualiser-info">
                {mode === 'radar' 
                    ? `Point Cloud: ${pointCloud.length} points | Max Range: 3200mm`
                    : 'RoboCup Junior Soccer Field Visualization'
                }
            </div>
        </div>
    );
}

export { Visualiser }