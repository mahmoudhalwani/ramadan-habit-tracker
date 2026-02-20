import React from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, CircleDot } from 'lucide-react';

const BottomNav = ({ activePage, onPageChange }) => {
    const tabs = [
        { id: 'tracker', label: 'Tracker', icon: Home },
        { id: 'athkar', label: 'Athkar', icon: BookOpen },
        { id: 'tasbih', label: 'Tasbih', icon: CircleDot },
    ];

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-inner">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activePage === tab.id;

                    return (
                        <button
                            key={tab.id}
                            className={`bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
                            onClick={() => onPageChange(tab.id)}
                            id={`nav-${tab.id}`}
                        >
                            {isActive && (
                                <motion.div
                                    className="bottom-nav-indicator"
                                    layoutId="nav-indicator"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon size={20} />
                            <span className="bottom-nav-label">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
