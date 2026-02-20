import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { ATHKAR_CATEGORIES, ATHKAR_DATA } from '../data/athkar';

const AthkarPage = () => {
    const [activeCategory, setActiveCategory] = useState('morning');
    const [counters, setCounters] = useState({});
    const [expandedId, setExpandedId] = useState(null);

    const category = ATHKAR_CATEGORIES.find(c => c.id === activeCategory);
    const athkarList = ATHKAR_DATA[activeCategory] || [];

    const getCount = useCallback((id) => counters[id] || 0, [counters]);

    const handleCount = useCallback((id, target) => {
        setCounters(prev => {
            const current = prev[id] || 0;
            if (target > 0 && current >= target) return prev;
            return { ...prev, [id]: current + 1 };
        });
    }, []);

    const handleReset = useCallback((id) => {
        setCounters(prev => ({ ...prev, [id]: 0 }));
    }, []);

    const handleResetAll = useCallback(() => {
        setCounters({});
    }, []);

    const isCompleted = useCallback((id, target) => {
        if (target === 0) return false;
        return (counters[id] || 0) >= target;
    }, [counters]);

    const completedCount = athkarList.filter(a => a.count > 0 && isCompleted(a.id, a.count)).length;
    const totalWithCount = athkarList.filter(a => a.count > 0).length;

    return (
        <div className="athkar-page">
            {/* Category Selector */}
            <div className="athkar-categories no-scrollbar">
                {ATHKAR_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`athkar-cat-chip ${activeCategory === cat.id ? 'athkar-cat-active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            '--cat-color': cat.color,
                        }}
                    >
                        <span className="athkar-cat-icon">{cat.icon}</span>
                        <span className="athkar-cat-name">{cat.nameEn}</span>
                    </button>
                ))}
            </div>

            {/* Header */}
            <div className="athkar-header">
                <div>
                    <h2 className="athkar-title font-arabic">{category?.name}</h2>
                    <p className="athkar-subtitle">{category?.nameEn}</p>
                </div>
                <div className="athkar-progress-info">
                    {totalWithCount > 0 && (
                        <span className="athkar-completed-count">
                            {completedCount}/{totalWithCount}
                        </span>
                    )}
                    <button
                        className="btn-icon"
                        onClick={handleResetAll}
                        title="Reset all counters"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Athkar List */}
            <div className="athkar-list">
                <AnimatePresence mode="popLayout">
                    {athkarList.map((dhikr, index) => {
                        const count = getCount(dhikr.id);
                        const completed = isCompleted(dhikr.id, dhikr.count);
                        const progress = dhikr.count > 0 ? Math.min(100, (count / dhikr.count) * 100) : 0;
                        const isExpanded = expandedId === dhikr.id;

                        return (
                            <motion.div
                                key={dhikr.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25, delay: index * 0.04 }}
                                layout
                                className={`athkar-card glass-card ${completed ? 'athkar-card-completed' : ''}`}
                                onClick={() => {
                                    if (dhikr.count > 0) {
                                        handleCount(dhikr.id, dhikr.count);
                                    }
                                }}
                            >
                                {/* Arabic Text */}
                                <div className="athkar-arabic font-arabic">
                                    {dhikr.arabic}
                                </div>

                                {/* Expand/collapse for translation */}
                                <button
                                    className="athkar-expand-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedId(isExpanded ? null : dhikr.id);
                                    }}
                                >
                                    {isExpanded ? 'Hide translation' : 'Show translation'}
                                    <ChevronRight
                                        size={14}
                                        style={{
                                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                        }}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="athkar-translation-wrap"
                                        >
                                            <p className="athkar-transliteration">{dhikr.transliteration}</p>
                                            <p className="athkar-translation">{dhikr.translation}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Counter */}
                                {dhikr.count > 0 && (
                                    <div className="athkar-counter-section">
                                        <div className="athkar-counter-bar-track">
                                            <motion.div
                                                className={`athkar-counter-bar-fill ${completed ? 'athkar-counter-complete' : ''}`}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <div className="athkar-counter-info">
                                            <span className="athkar-counter-text">
                                                {completed ? (
                                                    <span className="athkar-done-badge">
                                                        <Check size={12} /> Done
                                                    </span>
                                                ) : (
                                                    `${count} / ${dhikr.count}`
                                                )}
                                            </span>
                                            <button
                                                className="athkar-reset-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReset(dhikr.id);
                                                }}
                                            >
                                                <RotateCcw size={12} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Completed overlay glow */}
                                {completed && (
                                    <motion.div
                                        className="athkar-completed-glow"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AthkarPage;
