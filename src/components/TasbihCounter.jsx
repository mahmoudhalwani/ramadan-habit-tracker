import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Settings, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { TASBIH_PRESETS } from '../data/athkar';

const TasbihCounter = () => {
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(33);
    const [totalCount, setTotalCount] = useState(0);
    const [rounds, setRounds] = useState(0);
    const [activePreset, setActivePreset] = useState(TASBIH_PRESETS[0]);
    const [showPresets, setShowPresets] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [hapticEnabled, setHapticEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [ripples, setRipples] = useState([]);
    const beadAngle = useRef(0);

    // Load saved data
    useEffect(() => {
        const saved = localStorage.getItem('tasbih-counter');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCount(parsed.count || 0);
                setTotalCount(parsed.totalCount || 0);
                setRounds(parsed.rounds || 0);
                setTarget(parsed.target || 33);
                if (parsed.presetId) {
                    const preset = TASBIH_PRESETS.find(p => p.id === parsed.presetId);
                    if (preset) setActivePreset(preset);
                }
            } catch (e) { }
        }
    }, []);

    // Save data
    useEffect(() => {
        localStorage.setItem('tasbih-counter', JSON.stringify({
            count, totalCount, rounds, target,
            presetId: activePreset.id,
        }));
    }, [count, totalCount, rounds, target, activePreset]);

    const handleTap = useCallback(() => {
        // Haptic feedback
        if (hapticEnabled && navigator.vibrate) {
            navigator.vibrate(15);
        }

        // Add ripple effect
        const rippleId = Date.now();
        setRipples(prev => [...prev, rippleId]);
        setTimeout(() => setRipples(prev => prev.filter(r => r !== rippleId)), 800);

        setCount(prev => prev + 1);
        setTotalCount(prev => prev + 1);

        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
    }, [hapticEnabled]);

    // Handle round completion when count reaches target
    // Use a ref to prevent StrictMode from double-incrementing rounds
    const lastRoundCount = useRef(-1);
    useEffect(() => {
        if (count > 0 && count >= target && lastRoundCount.current !== count) {
            lastRoundCount.current = count;
            setRounds(r => r + 1);
            const timer = setTimeout(() => setCount(0), 300);
            return () => clearTimeout(timer);
        }
        if (count === 0) {
            lastRoundCount.current = -1;
        }
    }, [count, target]);

    const handleReset = useCallback(() => {
        setCount(0);
    }, []);

    const handleFullReset = useCallback(() => {
        setCount(0);
        setTotalCount(0);
        setRounds(0);
    }, []);

    const selectPreset = useCallback((preset) => {
        setActivePreset(preset);
        setTarget(preset.target);
        setCount(0);
        setShowPresets(false);
    }, []);

    const progress = target > 0 ? (count / target) * 100 : 0;
    const circumference = 2 * Math.PI * 140;
    const dashOffset = circumference - (progress / 100) * circumference;

    // Generate bead positions
    const beadCount = 33;
    const beads = Array.from({ length: beadCount }, (_, i) => {
        const angle = (i / beadCount) * 360;
        const isActive = i < (count % beadCount);
        return { angle, isActive, index: i };
    });

    return (
        <div className="tasbih-page">
            {/* Preset Selector */}
            <div className="tasbih-preset-selector">
                <button
                    className="tasbih-preset-btn glass-card"
                    onClick={() => setShowPresets(!showPresets)}
                >
                    <span className="tasbih-preset-arabic font-arabic">{activePreset.arabic}</span>
                    <ChevronDown
                        size={16}
                        style={{
                            transition: 'transform 0.2s',
                            transform: showPresets ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: 'var(--text-muted)',
                        }}
                    />
                </button>

                <AnimatePresence>
                    {showPresets && (
                        <motion.div
                            className="tasbih-presets-dropdown glass-card"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            {TASBIH_PRESETS.map(preset => (
                                <button
                                    key={preset.id}
                                    className={`tasbih-preset-option ${activePreset.id === preset.id ? 'active' : ''}`}
                                    onClick={() => selectPreset(preset)}
                                    style={{ '--preset-color': preset.color }}
                                >
                                    <span className="font-arabic" style={{ fontSize: '1.1rem' }}>{preset.arabic}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{preset.transliteration}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Translation */}
            <div className="tasbih-translation">
                <p>{activePreset.translation}</p>
            </div>

            {/* 3D Rosary Bead Circle */}
            <div className="tasbih-rosary-container">
                <div className="tasbih-3d-scene">
                    {/* Background glow */}
                    <div
                        className="tasbih-glow"
                        style={{
                            background: `radial-gradient(circle, ${activePreset.color}15 0%, transparent 70%)`,
                            opacity: isPressed ? 1 : 0.5,
                            transition: 'opacity 0.3s ease',
                        }}
                    />

                    {/* SVG Progress Ring */}
                    <svg className="tasbih-ring-svg" viewBox="0 0 300 300">
                        {/* Trail */}
                        <circle
                            cx="150" cy="150" r="140"
                            fill="none"
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth="3"
                        />
                        {/* Progress */}
                        <circle
                            cx="150" cy="150" r="140"
                            fill="none"
                            stroke={activePreset.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{
                                transition: 'stroke-dashoffset 0.3s ease',
                                transform: 'rotate(-90deg)',
                                transformOrigin: '50% 50%',
                                filter: `drop-shadow(0 0 8px ${activePreset.color}40)`,
                            }}
                        />
                    </svg>

                    {/* 3D Beads */}
                    <div className="tasbih-beads-ring">
                        {beads.map(bead => {
                            const rad = (bead.angle - 90) * (Math.PI / 180);
                            const radius = 125;
                            const x = 150 + radius * Math.cos(rad);
                            const y = 150 + radius * Math.sin(rad);

                            return (
                                <div
                                    key={bead.index}
                                    className={`tasbih-bead ${bead.isActive ? 'tasbih-bead-active' : ''}`}
                                    style={{
                                        left: `${(x / 300) * 100}%`,
                                        top: `${(y / 300) * 100}%`,
                                        '--bead-color': activePreset.color,
                                        transitionDelay: `${bead.index * 10}ms`,
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Center Tap Area */}
                    <motion.button
                        className="tasbih-tap-area"
                        onTap={handleTap}
                        whileTap={{ scale: 0.92 }}
                        style={{
                            '--glow-color': activePreset.color,
                        }}
                    >
                        {/* Ripple effects */}
                        {ripples.map(id => (
                            <span key={id} className="tasbih-ripple" style={{ borderColor: activePreset.color }} />
                        ))}

                        <motion.span
                            className="tasbih-count font-arabic"
                            key={count}
                            initial={{ scale: 1.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                            {count}
                        </motion.span>
                        <span className="tasbih-target-label">/ {target}</span>
                    </motion.button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="tasbih-stats">
                <div className="tasbih-stat">
                    <span className="tasbih-stat-value">{totalCount}</span>
                    <span className="tasbih-stat-label">Total</span>
                </div>
                <div className="tasbih-stat-divider" />
                <div className="tasbih-stat">
                    <span className="tasbih-stat-value">{rounds}</span>
                    <span className="tasbih-stat-label">Rounds</span>
                </div>
                <div className="tasbih-stat-divider" />
                <div className="tasbih-stat">
                    <span className="tasbih-stat-value">{target}</span>
                    <span className="tasbih-stat-label">Target</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="tasbih-actions">
                <button
                    className="tasbih-action-btn glass-card"
                    onClick={handleReset}
                    title="Reset current count"
                >
                    <RotateCcw size={18} />
                    <span>Reset</span>
                </button>
                <button
                    className="tasbih-action-btn glass-card tasbih-action-danger"
                    onClick={handleFullReset}
                    title="Reset everything"
                >
                    <RotateCcw size={18} />
                    <span>Full Reset</span>
                </button>
                <button
                    className={`tasbih-action-btn glass-card ${hapticEnabled ? 'tasbih-action-active' : ''}`}
                    onClick={() => setHapticEnabled(!hapticEnabled)}
                    title="Toggle vibration"
                >
                    {hapticEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    <span>Vibrate</span>
                </button>
            </div>
        </div>
    );
};

export default TasbihCounter;
