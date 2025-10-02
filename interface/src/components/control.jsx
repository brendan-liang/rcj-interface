import { useContext, useEffect, useState, useRef } from "react"
import { UserContext } from "../App.jsx"

function ControlTile() {
    const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
    const [rotationValue, setRotationValue] = useState(0); // -1 to 1 range
    const [verticalSliderValue, setVerticalSliderValue] = useState(0); // -1 to 1 range for new slider
    const [shifting, setShifting] = useState(0);
    const [moveSpeed, setMoveSpeed] = useState(1); // Speed state
    const [dribbleValue, setDribbleValue] = useState(0); // -1, 0, or 1
    const [isDragging, setIsDragging] = useState(false);
    const [isRotationDragging, setIsRotationDragging] = useState(false);
    const [isVerticalSliderDragging, setIsVerticalSliderDragging] = useState(false);
    const [keysPressed, setKeysPressed] = useState(new Set());
    const [gamepadConnected, setGamepadConnected] = useState(false);
    const [gamepadIndex, setGamepadIndex] = useState(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const joystickRef = useRef(null);
    const containerRef = useRef(null);
    const rotationSliderRef = useRef(null);
    const verticalSliderRef = useRef(null);
    const gamepadRef = useRef(null);
    const { selectedBot, robots } = useContext(UserContext);

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

    // Rotation slider handlers
    const handleRotationMouseDown = (e) => {
        setIsRotationDragging(true);
        updateRotationFromMouse(e);
        e.preventDefault();
    };

    const handleRotationMouseMove = (e) => {
        if (!isRotationDragging || !rotationSliderRef.current || !isEnabled) return;
        updateRotationFromMouse(e);
    };

    const handleRotationMouseUp = () => {
        setIsRotationDragging(false);
        setRotationValue(0); // Return to center
    };

    const handleRotationTouchStart = (e) => {
        setIsRotationDragging(true);
        updateRotationFromTouch(e);
        e.preventDefault();
    };

    const handleRotationTouchMove = (e) => {
        if (!isRotationDragging || !rotationSliderRef.current || !isEnabled) return;
        updateRotationFromTouch(e);
    };

    const handleRotationTouchEnd = () => {
        setIsRotationDragging(false);
        setRotationValue(0);
    };

    const updateRotationFromMouse = (e) => {
        if (!rotationSliderRef.current) return;
        
        const rect = rotationSliderRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const deltaX = e.clientX - centerX;
        const maxDistance = rect.width / 2 - 15; // Account for knob size
        
        let normalizedX = deltaX / maxDistance;
        normalizedX = Math.max(-1, Math.min(1, normalizedX)); // Clamp to -1, 1
        
        setRotationValue(normalizedX);
    };

    const updateRotationFromTouch = (e) => {
        if (!rotationSliderRef.current) return;
        
        const touch = e.touches[0];
        const rect = rotationSliderRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const deltaX = touch.clientX - centerX;
        const maxDistance = rect.width / 2 - 15;
        
        let normalizedX = deltaX / maxDistance;
        normalizedX = Math.max(-1, Math.min(1, normalizedX));
        
        setRotationValue(normalizedX);
    };

    // Vertical slider handlers
    const handleVerticalSliderMouseDown = (e) => {
        setIsVerticalSliderDragging(true);
        updateVerticalSliderFromMouse(e);
        e.preventDefault();
    };

    const handleVerticalSliderMouseMove = (e) => {
        if (!isVerticalSliderDragging || !verticalSliderRef.current || !isEnabled) return;
        updateVerticalSliderFromMouse(e);
    };

    const handleVerticalSliderMouseUp = () => {
        setIsVerticalSliderDragging(false);
        setVerticalSliderValue(0); // Return to center
    };

    const handleVerticalSliderTouchStart = (e) => {
        setIsVerticalSliderDragging(true);
        updateVerticalSliderFromTouch(e);
        e.preventDefault();
    };

    const handleVerticalSliderTouchMove = (e) => {
        if (!isVerticalSliderDragging || !verticalSliderRef.current || !isEnabled) return;
        updateVerticalSliderFromTouch(e);
    };

    const handleVerticalSliderTouchEnd = () => {
        setIsVerticalSliderDragging(false);
        setVerticalSliderValue(0);
    };

    const updateVerticalSliderFromMouse = (e) => {
        if (!verticalSliderRef.current) return;
        
        const rect = verticalSliderRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const deltaX = e.clientX - centerX;
        const maxDistance = rect.width / 2 - 15; // Account for knob size
        
        let normalizedX = deltaX / maxDistance;
        normalizedX = Math.max(-1, Math.min(1, normalizedX)); // Clamp to -1, 1
        
        setVerticalSliderValue(normalizedX);
        
        // Check for section entry
        if (normalizedX < -0.7) {
            onLeftSectionEnter();
        } else if (normalizedX > 0.7) {
            onRightSectionEnter();
        } else {
            setShifting(0);
        }
    };

    const updateVerticalSliderFromTouch = (e) => {
        if (!verticalSliderRef.current) return;
        
        const touch = e.touches[0];
        const rect = verticalSliderRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const deltaX = touch.clientX - centerX;
        const maxDistance = rect.width / 2 - 15;
        
        let normalizedX = deltaX / maxDistance;
        normalizedX = Math.max(-1, Math.min(1, normalizedX));
        
        setVerticalSliderValue(normalizedX);
        
        // Check for section entry
        if (normalizedX < -0.7) {
            onLeftSectionEnter();
        } else if (normalizedX > 0.7) {
            onRightSectionEnter();
        } else {
            setShifting(0);
        }
    };

    // Functions to call when entering left/right sections
    const onLeftSectionEnter = () => {
        if (shifting === 1) return;
        setShifting(1)
    };

    const onRightSectionEnter = () => {
        // Add your custom code here for right section
        if (shifting === -1) return;
        setShifting(-1)
    };

    const handleKeyDown = (e) => {
        if (!isEnabled) return;
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'q', 'e', ',', '.'].includes(key)) {
            e.preventDefault();
            setKeysPressed(prev => new Set([...prev, key]));
        }
    };

    const handleKeyUp = (e) => {
        if (!isEnabled) return;
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'q', 'e', ',', '.'].includes(key)) {
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

    const updateRotationFromKeys = () => {
        if (isRotationDragging || !isEnabled) return;

        let rotation = 0;
        if (keysPressed.has('arrowleft')) rotation -= 1;
        if (keysPressed.has('arrowright')) rotation += 1;

        setRotationValue(rotation);
    };

    const updateVerticalSliderFromKeys = () => {
        if (isVerticalSliderDragging || !isEnabled) return;

        let value = 0;
        if (keysPressed.has('arrowup') || keysPressed.has('q')) value -= 1; // Left
        if (keysPressed.has('arrowdown') || keysPressed.has('e')) value += 1; // Right

        setVerticalSliderValue(value);
        
        // Check for section entry
        if (value < -0.5) {
            onLeftSectionEnter();
        } else if (value > 0.5) {
            onRightSectionEnter();
        } else {
            setShifting(0);
        }
    };

    const updateDribbleFromKeys = () => {
        if (!isEnabled) return;

        let dribble = 0;
        if (keysPressed.has(',')) dribble = -1; // Left dribble
        if (keysPressed.has('.')) dribble = 1;  // Right dribble

        setDribbleValue(dribble);
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
            setRotationValue(0);
        }
    };

    const updateGamepadInput = () => {
        if (!gamepadConnected || gamepadIndex === null) return;

        const gamepad = navigator.getGamepads()[gamepadIndex];
        if (!gamepad) return;

        // Left stick axes (typically axes 0 and 1)
        const leftStickX = gamepad.axes[0] || 0;
        const leftStickY = gamepad.axes[1] || 0;

        // Right stick axes (typically axes 2 and 3)
        const rightStickX = gamepad.axes[2] || 0;
        const rightStickY = gamepad.axes[3] || 0;

        // Triggers (typically buttons 6 and 7, or axes 4 and 5)
        const leftTrigger = gamepad.buttons[6]?.pressed || (gamepad.axes[4] && gamepad.axes[4] > 0.5);
        const rightTrigger = gamepad.buttons[7]?.pressed || (gamepad.axes[5] && gamepad.axes[5] > 0.5);

        // Apply deadzone to prevent drift
        const deadzone = 0.1;
        const x = Math.abs(leftStickX) > deadzone ? leftStickX : 0;
        const y = Math.abs(leftStickY) > deadzone ? -leftStickY : 0; // Invert Y for intuitive controls
        const rotation = Math.abs(rightStickX) > deadzone ? rightStickX : 0;
        const verticalSlider = Math.abs(rightStickY) > deadzone ? rightStickY : 0;

        // Only update if not using other input methods
        if (!isDragging && keysPressed.size === 0 && isEnabled) {
            setJoystickPosition({ x, y });
        }

        if (!isRotationDragging && !keysPressed.has('arrowleft') && !keysPressed.has('arrowright') && isEnabled) {
            setRotationValue(rotation);
        }

        if (!isVerticalSliderDragging && !keysPressed.has('arrowup') && !keysPressed.has('arrowdown') && !keysPressed.has('q') && !keysPressed.has('e') && isEnabled) {
            setVerticalSliderValue(verticalSlider);
            
            // Check for section entry
            if (verticalSlider < -0.7) {
                onLeftSectionEnter();
            } else if (verticalSlider > 0.7) {
                onRightSectionEnter();
            } else {
                setShifting(0);
            }
        }

        // Update dribble from triggers (only if keys aren't being used)
        if (!keysPressed.has(',') && !keysPressed.has('.') && isEnabled) {
            let dribble = 0;
            if (leftTrigger) dribble = -1;
            if (rightTrigger) dribble = 1;
            setDribbleValue(dribble);
        }
    };

    useEffect(() => {
        const newSpeed = Math.min(Math.max(moveSpeed + shifting * 0.5, 0.5), 5);
        setMoveSpeed(newSpeed);
    }, [shifting])

    useEffect(() => {
        // Called whenever joystickPosition or rotationValue changes
        if (!isNaN(selectedBot) && isEnabled) {
            const message = {
                message: "move",
                data: {
                    x: joystickPosition.x,
                    y: joystickPosition.y,
                    rotation: rotationValue,
                    speed: moveSpeed
                }
            };
            if (robots[selectedBot]) {
                robots[selectedBot].send(message);
            }
        }
    }, [joystickPosition, rotationValue, moveSpeed])

    useEffect(() => {
        // Called whenever dribbleValue changes
        if (!isNaN(selectedBot) && isEnabled) {
            const message = {
                message: "dribble",
                data: {
                    dribble: dribbleValue
                }
            };
            if (robots[selectedBot]) {
                robots[selectedBot].send(message);
            }
        }
    }, [dribbleValue, selectedBot, robots, isEnabled]);

    useEffect(() => {
        updateJoystickFromKeys();
        updateRotationFromKeys();
        updateVerticalSliderFromKeys();
        updateDribbleFromKeys();
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
    }, [gamepadConnected, isDragging, keysPressed, isEnabled, isRotationDragging]);

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

    useEffect(() => {
        if (isRotationDragging) {
            document.addEventListener('mousemove', handleRotationMouseMove);
            document.addEventListener('mouseup', handleRotationMouseUp);
            document.addEventListener('touchmove', handleRotationTouchMove);  
            document.addEventListener('touchend', handleRotationTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleRotationMouseMove);
            document.removeEventListener('mouseup', handleRotationMouseUp);
            document.removeEventListener('touchmove', handleRotationTouchMove);
            document.removeEventListener('touchend', handleRotationTouchEnd);
        };
    }, [isRotationDragging]);

    useEffect(() => {
        if (isVerticalSliderDragging) {
            document.addEventListener('mousemove', handleVerticalSliderMouseMove);
            document.addEventListener('mouseup', handleVerticalSliderMouseUp);
            document.addEventListener('touchmove', handleVerticalSliderTouchMove);
            document.addEventListener('touchend', handleVerticalSliderTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleVerticalSliderMouseMove);
            document.removeEventListener('mouseup', handleVerticalSliderMouseUp);
            document.removeEventListener('touchmove', handleVerticalSliderTouchMove);
            document.removeEventListener('touchend', handleVerticalSliderTouchEnd);
        };
    }, [isVerticalSliderDragging]);

    // Calculate knob position
    const knobX = joystickPosition.x * 70; // 70px max distance from center
    const knobY = -joystickPosition.y * 70; // Invert for display

    // Calculate rotation slider position
    const rotationKnobX = rotationValue * 85; // 85px max distance from center

    // Calculate vertical slider position
    const verticalSliderKnobX = verticalSliderValue * 85; // 85px max distance from center

    const handleEnable = () => {
        setIsEnabled(!isEnabled);
    }

    const handleStop = () => {
        setJoystickPosition({ x: 0, y: 0 });
        setRotationValue(0);
        setVerticalSliderValue(0);
        setDribbleValue(0);
        setKeysPressed(new Set()); // Clear any pressed keys
    };

    const getInputSource = () => {
        if (keysPressed.size > 0) {
            return Array.from(keysPressed).join('+').toUpperCase();
        } else if (isDragging || isRotationDragging || isVerticalSliderDragging){
            return 'Mouse/Touch';
        } else if (gamepadConnected && (Math.abs(joystickPosition.x) > 0.05 || Math.abs(joystickPosition.y) > 0.05 || Math.abs(rotationValue) > 0.05 || Math.abs(verticalSliderValue) > 0.05 || dribbleValue !== 0)) {
            return 'Gamepad';
        } else {
            return gamepadConnected ? 'Waiting (G)' : 'Waiting...';
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

                {/* Rotation Slider */}
                <div className="rotation-section">
                    <div 
                        className="rotation-slider"
                        ref={rotationSliderRef}
                        onMouseDown={handleRotationMouseDown}
                        onTouchStart={handleRotationTouchStart}
                        style={{
                            position: 'relative',
                            width: '200px',
                            height: '40px',
                            background: 'rgba(30, 41, 59, 0.8)',
                            border: '2px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '20px',
                            margin: '20px auto 0 auto',
                            cursor: isEnabled ? 'pointer' : 'not-allowed',
                            opacity: isEnabled ? 1 : 0.5,
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                    >
                        {/* Center line */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '0',
                            width: '2px',
                            height: '100%',
                            background: 'rgba(100, 116, 139, 0.5)',
                            transform: 'translateX(-50%)'
                        }} />
                        
                        {/* Left/Right indicators */}
                        <div style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)'
                        }}>◀</div>
                        <div style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)'
                        }}>▶</div>
                        
                        {/* Rotation knob */}
                        <div 
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                width: '30px',
                                height: '30px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: '2px solid rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                transform: `translate(calc(-50% + ${rotationKnobX}px), -50%)`,
                                transition: isRotationDragging ? 'none' : 'transform 0.1s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                cursor: 'grab',
                                zIndex: 10
                            }}
                        >
                            🔄
                        </div>
                    </div>
                </div>

                {/* Vertical Slider */}
                <div className="vertical-slider-section">
                    <div 
                        className="vertical-slider"
                        ref={verticalSliderRef}
                        onMouseDown={handleVerticalSliderMouseDown}
                        onTouchStart={handleVerticalSliderTouchStart}
                        style={{
                            position: 'relative',
                            width: '200px',
                            height: '40px',
                            background: 'rgba(30, 41, 59, 0.8)',
                            border: '2px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '20px',
                            margin: '10px auto 0 auto',
                            cursor: isEnabled ? 'pointer' : 'not-allowed',
                            opacity: isEnabled ? 1 : 0.5,
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                    >
                        {/* Center line */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '0',
                            width: '2px',
                            height: '100%',
                            background: 'rgba(100, 116, 139, 0.5)',
                            transform: 'translateX(-50%)'
                        }} />
                        
                        {/* Left/Right sections */}
                        <div style={{
                            position: 'absolute',
                            left: '0',
                            top: '0',
                            width: '30%',
                            height: '100%',
                            background: verticalSliderValue < -0.7 ? 'rgba(34, 197, 94, 0.3)' : 'transparent',
                            borderRadius: '20px 0 0 20px',
                            transition: 'background 0.2s ease'
                        }} />
                        <div style={{
                            position: 'absolute',
                            right: '0',
                            top: '0',
                            width: '30%',
                            height: '100%',
                            background: verticalSliderValue > 0.7 ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
                            borderRadius: '0 20px 20px 0',
                            transition: 'background 0.2s ease'
                        }} />
                        
                        {/* Left/Right indicators */}
                        <div style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)'
                        }}>Q ▲</div>
                        <div style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)'
                        }}>▼ E</div>
                        
                        {/* Vertical slider knob */}
                        <div 
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                width: '30px',
                                height: '30px',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                border: '2px solid rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                transform: `translate(calc(-50% + ${verticalSliderKnobX}px), -50%)`,
                                transition: isVerticalSliderDragging ? 'none' : 'transform 0.1s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                cursor: 'grab',
                                zIndex: 10
                            }}
                        >
                            ⚡
                        </div>
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
                        Rotation: {rotationValue.toFixed(2)}
                    </div>
                    <div className="joystick-value">
                        Speed: {moveSpeed}
                    </div>
                    <div className="joystick-value" style={{
                        background: dribbleValue !== 0 ? 
                            (dribbleValue === 1 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)') :
                            'rgba(51, 65, 85, 0.6)'
                    }}>
                        Dribble: {dribbleValue === 1 ? 'Keep (.)' : dribbleValue === -1 ? 'Kick (,)' : 'Off'}
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