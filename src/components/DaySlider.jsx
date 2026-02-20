import React, { useRef, useEffect } from 'react';

const DaySlider = ({ currentDay, onDayChange, days, getProgress }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            const activeEl = scrollRef.current.querySelector(`[data-day="${currentDay}"]`);
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentDay]);

    return (
        <div className="day-slider-container">
            <div className="day-slider-fade-left" />
            <div className="day-slider-fade-right" />

            <div ref={scrollRef} className="day-slider-track no-scrollbar">
                {days.map((day) => {
                    const isActive = day === currentDay;
                    const progress = getProgress ? getProgress(day) : 0;
                    const isComplete = progress === 100;
                    const hasData = progress > 0;

                    let chipClass = 'day-chip';
                    if (isActive) chipClass += ' day-chip-active';
                    else if (isComplete) chipClass += ' day-chip-complete';
                    else if (hasData) chipClass += ' day-chip-has-data';

                    return (
                        <div
                            key={day}
                            data-day={day}
                            onClick={() => onDayChange(day)}
                            className={chipClass}
                            style={!isActive ? {
                                transform: `scale(${isActive ? 1.18 : 0.92}) perspective(600px) rotateY(${day < currentDay ? 8 : day > currentDay ? -8 : 0}deg)`,
                            } : undefined}
                        >
                            <span className="day-chip-label">Day</span>
                            <span className="day-chip-number">{day}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DaySlider;
