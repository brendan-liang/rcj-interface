import { useContext, useEffect, useState, useRef } from "react"
import { UserContext } from "../App.jsx"

function ControlTile() {
    const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [keysPressed, setKeysPressed] = useState(new Set());
    const [gamepadConnected, setGamepadConnected] = useState(false);
    const [gamepadIndex, setGamepadIndex] = useState(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const joystickRef = useRef(null);
    const containerRef = useRef(null);
    const gamepadRef = useRef(null);
    const { selectedBot } = useContext(UserContext);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current || !isEnabled ) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        // Calculate distance from center
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = rect.width / 2 - 30; // Account for knob size
        
        // Constrain to circle
        let x = deltaX;
        let y = deltaY;
        
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            x = Math.cos(angle) * maxDistance;
            y = Math.sin(angle) * maxDistance;
        }
        
        // Normalize to -1 to 1 range
        const normalizedX = x / maxDistance;
        const normalizedY = -y / maxDistance; // Invert Y for intuitive controls
        
        setJoystickPosition({ x: normalizedX, y: normalizedY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        // Return to center with smooth animation
        setJoystickPosition({ x: 0, y: 0 });
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const handleTouchMove = (e) => {
        if (!isDragging || !containerRef.current || !isEnabled) return;

        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = touch.clientX - centerX;
        const deltaY = touch.clientY - centerY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = rect.width / 2 - 30;
        
        let x = deltaX;
        let y = deltaY;
        
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            x = Math.cos(angle) * maxDistance;
            y = Math.sin(angle) * maxDistance;
        }
        
        const normalizedX = x / maxDistance;
        const normalizedY = -y / maxDistance;
        
        setJoystickPosition({ x: normalizedX, y: normalizedY });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setJoystickPosition({ x: 0, y: 0 });
    };

    const handleKeyDown = (e) => {
        if (!isEnabled) return;
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
            e.preventDefault();
            setKeysPressed(prev => new Set([...prev, key]));
        }
    };

    const handleKeyUp = (e) => {
        if (!isEnabled) return;
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
            e.preventDefault();
            setKeysPressed(prev => {
                const newKeys = new Set(prev);
                newKeys.delete(key);
                return newKeys;
            });
        }
    };

    const updateJoystickFromKeys = () => {
        if (isDragging || !isEnabled) return;

        let x = 0;
        let y = 0;

        if (keysPressed.has('a')) x -= 1; // Left
        if (keysPressed.has('d')) x += 1; // Right
        if (keysPressed.has('w')) y += 1; // Up
        if (keysPressed.has('s')) y -= 1; // Down

        // Normalize diagonal movement to maintain consistent speed
        if (x !== 0 && y !== 0) {
            const magnitude = Math.sqrt(x * x + y * y);
            x = x / magnitude;
            y = y / magnitude;
        }

        setJoystickPosition({ x, y });
    };

    const handleGamepadConnect = (e) => {
        console.log('Gamepad connected:', e.gamepad.id);
        setGamepadConnected(true);
        setGamepadIndex(e.gamepad.index);
    };

    const handleGamepadDisconnect = (e) => {
        console.log('Gamepad disconnected:', e.gamepad.id);
        setGamepadConnected(false);
        setGamepadIndex(null);
        // Return joystick to center when gamepad disconnects
        if (!isDragging && keysPressed.size === 0) {
            setJoystickPosition({ x: 0, y: 0 });
        }
    };

    const updateGamepadInput = () => {
        if (!gamepadConnected || gamepadIndex === null) return;

        const gamepad = navigator.getGamepads()[gamepadIndex];
        if (!gamepad) return;

        // Left stick axes (typically axes 0 and 1)
        const leftStickX = gamepad.axes[0] || 0;
        const leftStickY = gamepad.axes[1] || 0;

        // Apply deadzone to prevent drift
        const deadzone = 0.1;
        const x = Math.abs(leftStickX) > deadzone ? leftStickX : 0;
        const y = Math.abs(leftStickY) > deadzone ? -leftStickY : 0; // Invert Y for intuitive controls

        // Only update if not using other input methods
        if (!isDragging && keysPressed.size === 0 && isEnabled) {
            setJoystickPosition({ x, y });
        }
    };

    useEffect(() => {
        
    }, [joystickPosition])

    useEffect(() => {
        updateJoystickFromKeys();
    }, [keysPressed]);

    useEffect(() => {
        // Add keyboard event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Add gamepad event listeners
        window.addEventListener('gamepadconnected', handleGamepadConnect);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnect);

        // Check for already connected gamepads
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                setGamepadConnected(true);
                setGamepadIndex(i);
                console.log('Gamepad already connected:', gamepads[i].id);
                break;
            }
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('gamepadconnected', handleGamepadConnect);
            window.removeEventListener('gamepaddisconnected', handleGamepadDisconnect);
        };
    }, [isEnabled]); // Add isEnabled as dependency

    useEffect(() => {
        // Gamepad polling loop
        const pollGamepad = () => {
            updateGamepadInput();
            gamepadRef.current = requestAnimationFrame(pollGamepad);
        };

        if (gamepadConnected) {
            gamepadRef.current = requestAnimationFrame(pollGamepad);
        }

        return () => {
            if (gamepadRef.current) {
                cancelAnimationFrame(gamepadRef.current);
            }
        };
    }, [gamepadConnected, isDragging, keysPressed, isEnabled]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);

    // Calculate knob position
    const knobX = joystickPosition.x * 70; // 70px max distance from center
    const knobY = -joystickPosition.y * 70; // Invert for display

    const handleEnable = () => {
        // Placeholder for enabling robot control
        setIsEnabled(!isEnabled);
    }

    const handleStop = () => {
        setJoystickPosition({ x: 0, y: 0 });
        setKeysPressed(new Set()); // Clear any pressed keys
    };

    const getInputSource = () => {
        if (keysPressed.size > 0) {
            return Array.from(keysPressed).join('+').toUpperCase();
        } else if (isDragging){
            return 'Mouse/Touch';
        } else if (gamepadConnected && Math.abs(joystickPosition.x) > 0.05 || Math.abs(joystickPosition.y) > 0.05) {
            return 'Gamepad';
        } else {
            return gamepadConnected ? 'Gamepad Ready' : 'Mouse/Touch';
        }
    };

    return (
        <div className="Control tile">
            <h2>🎮 Control Panel</h2>
            
            <div className="joystick-section">
                <div 
                    className="joystick-container"
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    <div className="joystick-background"></div>
                    <div className="joystick-center-ring"></div>
                    
                    <div className="joystick-indicators">
                        <div className="joystick-indicator north">▲ W</div>
                        <div className="joystick-indicator south">▼ S</div>
                        <div className="joystick-indicator east">▶ D</div>
                        <div className="joystick-indicator west">◀ A</div>
                        {gamepadConnected && (
                            <div className="joystick-indicator center" style={{
                                position: 'absolute',
                                bottom: '-30px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '0.7rem',
                                color: '#10b981'
                            }}>
                                🎮 Connected
                            </div>
                        )}
                    </div>
                    
                    <div 
                        className="joystick-knob"
                        ref={joystickRef}
                        style={{
                            transform: `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`,
                            transition: isDragging ? 'none' : 'transform 0.1s ease'
                        }}
                    >
                        🎯
                    </div>
                </div>
            </div>

            <div className="control-info-section">
                <div className="joystick-values">
                    <div className="joystick-value">
                        Angle: {(() => {
                            const { x, y } = joystickPosition;
                            if (x === 0 && y === 0) return '0°';
                            // atan2 returns radians, convert to degrees, 0° is up
                            let angle = Math.atan2(x, y) * 180 / Math.PI;
                            if (angle < 0) angle += 360;
                            return angle.toFixed(0) + '°';
                        })()}
                    </div>
                    <div className="joystick-value">
                        Speed: {Math.sqrt(joystickPosition.x ** 2 + joystickPosition.y ** 2).toFixed(2)}
                    </div>
                    <div className="joystick-value">
                        Input: {getInputSource()}
                    </div>
                </div>
                
                <button className="control-button control-button-toggle" onClick={handleEnable} style={{
                    background: isEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    borderColor: isEnabled ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                }}>
                    {isEnabled ? "⏸ On" : "▶ Off"}
                </button>
                
                <button className="control-button control-button-stop" onClick={handleStop}>
                    ⏹ Stop
                </button>
            </div>
        </div>
    )
}

export { ControlTile }