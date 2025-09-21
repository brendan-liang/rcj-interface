import { useContext, useEffect, useState, useRef } from "react"
import { UserContext } from "../App.jsx";
import { robotManager } from "./robots.jsx";

function Visualiser() {
    const [mode, setMode] = useState('radar'); // 'radar' or 'field'
    const canvasRef = useRef(null);
    const [pointCloud, setPointCloud] = useState([]);

    useEffect(() => {
        // Generate some sample point cloud data for demonstration
        const updatePointCloud = (id, message) => {
            if (!message) { return ;}
            const data = JSON.parse(message.data);
            if (data.message === "lidar") {
                setPointCloud(data.data);
            } else { return; }
        };

        robotManager.on('robotMessage', updatePointCloud);

        return () => {
            robotManager.off('robotMessage', updatePointCloud);
        };
    }, []);

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
    }, [mode, pointCloud]);

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
        const fieldWidth = 2430;
        const fieldHeight = 1820;
        
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

        // Draw field border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);

        // Draw center line
        ctx.beginPath();
        ctx.moveTo(offsetX + drawWidth / 2, offsetY);
        ctx.lineTo(offsetX + drawWidth / 2, offsetY + drawHeight);
        ctx.stroke();

        // Draw center circle
        const centerRadius = 200 * scale; // 200mm radius
        ctx.beginPath();
        ctx.arc(offsetX + drawWidth / 2, offsetY + drawHeight / 2, centerRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw penalty areas (400mm x 200mm)
        const penaltyWidth = 400 * scale;
        const penaltyHeight = 200 * scale;
        
        // Left penalty area
        ctx.strokeRect(offsetX, offsetY + (drawHeight - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
        
        // Right penalty area
        ctx.strokeRect(offsetX + drawWidth - penaltyWidth, offsetY + (drawHeight - penaltyHeight) / 2, penaltyWidth, penaltyHeight);

        // Draw goals (100mm deep)
        const goalDepth = 100 * scale;
        const goalWidth = 200 * scale;
        
        // Left goal
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(offsetX - goalDepth, offsetY + (drawHeight - goalWidth) / 2, goalDepth, goalWidth);
        ctx.strokeRect(offsetX - goalDepth, offsetY + (drawHeight - goalWidth) / 2, goalDepth, goalWidth);
        
        // Right goal
        ctx.fillRect(offsetX + drawWidth, offsetY + (drawHeight - goalWidth) / 2, goalDepth, goalWidth);
        ctx.strokeRect(offsetX + drawWidth, offsetY + (drawHeight - goalWidth) / 2, goalDepth, goalWidth);

        // Add field labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('RCJ Soccer Field', width / 2, offsetY - 10);
        ctx.fillText(`${fieldWidth}mm × ${fieldHeight}mm`, width / 2, height - 10);
    };

    return (
        <div className="Visualiser tile">
            <div className="visualiser-header">
                <h2>📊 Visualizer</h2>
                <select 
                    value={mode} 
                    onChange={(e) => setMode(e.target.value)}
                >
                    <option value="radar">🎯 Radar Mode</option>
                    <option value="field">⚽ Field Mode</option>
                </select>
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