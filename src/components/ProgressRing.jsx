import React from 'react';

const ProgressRing = ({ progress, size = 80, strokeWidth = 6, color = '#f7c948', trailColor = 'rgba(255,255,255,0.06)' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {/* Trail */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={trailColor}
                strokeWidth={strokeWidth}
            />
            {/* Progress */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                    transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: progress > 0 ? `drop-shadow(0 0 6px ${color}40)` : 'none'
                }}
            />
        </svg>
    );
};

export default ProgressRing;
