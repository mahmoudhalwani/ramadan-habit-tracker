import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Minus, Plus, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CATEGORY_COLORS } from '../data/habits';

const HabitCard = ({ habit, status, onUpdate, onRemove }) => {
    const Icon = Icons[habit.icon] || Icons.Star;
    const isCompleted = habit.type === 'boolean' ? !!status : ((status || 0) >= (habit.target || 1));
    const [isFlipped, setIsFlipped] = useState(false);
    const cardRef = useRef(null);
    const catColor = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.custom;

    const handleToggle = () => {
        if (habit.type === 'boolean') {
            const newVal = !status;
            onUpdate(newVal);
            if (newVal) {
                setIsFlipped(true);
                setTimeout(() => setIsFlipped(false), 1800);
            }
        }
    };

    const handleIncrement = (e) => {
        e.stopPropagation();
        onUpdate((status || 0) + 1);
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        if ((status || 0) > 0) onUpdate((status || 0) - 1);
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        cardRef.current.style.setProperty('--mouse-x', x + '%');
        cardRef.current.style.setProperty('--mouse-y', y + '%');
    };

    const counterProgress = habit.type === 'counter'
        ? Math.min(100, ((status || 0) / (habit.target || 1)) * 100)
        : 0;

    return (
        <div className="perspective-container" style={{ minHeight: '100px' }}>
            <motion.div
                className={`card-3d ${isFlipped && habit.type === 'boolean' ? 'flipped' : ''}`}
                style={{ position: 'relative', minHeight: '100px' }}
                animate={{ rotateY: isFlipped && habit.type === 'boolean' ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
                {/* Front Face */}
                <div
                    ref={cardRef}
                    className={`habit-card glass-card ${isCompleted ? 'glass-card-completed' : ''}`}
                    style={{ position: isFlipped ? 'absolute' : 'relative', inset: isFlipped ? 0 : undefined, backfaceVisibility: 'hidden' }}
                    onClick={handleToggle}
                    onMouseMove={handleMouseMove}
                >
                    {/* Custom habit remove button */}
                    {habit.custom && onRemove && (
                        <button
                            className="remove-habit-btn"
                            onClick={(e) => { e.stopPropagation(); onRemove(habit.id); }}
                            title="Remove habit"
                        >
                            <X size={10} />
                        </button>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className={`habit-icon-wrap ${isCompleted ? 'habit-icon-completed' : 'habit-icon-default'}`}>
                            <Icon size={20} />
                        </div>

                        {habit.type === 'counter' && (
                            <div className="counter-controls">
                                <button className="counter-btn" onClick={handleDecrement}>
                                    <Minus size={14} />
                                </button>
                                <span className="counter-value">{status || 0}</span>
                                <button className="counter-btn" onClick={handleIncrement}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        )}

                        {habit.type === 'boolean' && isCompleted && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                                <CheckCircle2 size={20} style={{ color: 'var(--accent-green)' }} />
                            </motion.div>
                        )}
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="habit-name">{habit.name}</span>
                            <span
                                className="habit-category"
                                style={{ color: catColor.text }}
                            >
                                {habit.category}
                            </span>
                        </div>

                        {habit.type === 'counter' && (
                            <>
                                <div className="counter-bar">
                                    <div
                                        className={`counter-bar-fill ${isCompleted ? 'counter-bar-fill-complete' : ''}`}
                                        style={{ width: `${counterProgress}%` }}
                                    />
                                </div>
                                <span className="counter-target">
                                    {status || 0} / {habit.target} {habit.unit}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Back Face (Completed Flip) */}
                {habit.type === 'boolean' && (
                    <div
                        className="habit-card glass-card glass-card-completed card-face-back"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backfaceVisibility: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                        onClick={handleToggle}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                        >
                            <CheckCircle2 size={40} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
                        </motion.div>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '1rem' }}>
                            Completed!
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            +{habit.xpReward || 10} XP
                        </span>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default HabitCard;
