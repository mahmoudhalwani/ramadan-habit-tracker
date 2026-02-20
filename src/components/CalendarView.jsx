import React from 'react';

const CalendarView = ({ data, getProgress, currentDay, onDayChange }) => {
    // 30-day calendar, 7 columns
    const totalDays = 30;
    // First day starts on column 1 (no offset for simplicity)
    const cells = [];

    for (let d = 1; d <= totalDays; d++) {
        const progress = getProgress(d);
        let cellClass = 'calendar-cell';

        if (progress === 100) {
            cellClass += ' calendar-cell-complete';
        } else if (progress > 0) {
            cellClass += ' calendar-cell-partial';
        } else {
            cellClass += ' calendar-cell-default';
        }

        if (d === currentDay) {
            cellClass += ' calendar-cell-today';
        }

        cells.push(
            <div
                key={d}
                className={cellClass}
                onClick={() => onDayChange(d)}
                title={`Day ${d} — ${progress}%`}
            >
                {d}
            </div>
        );
    }

    // Fill remaining cells in the last row
    const remainder = totalDays % 7;
    if (remainder > 0) {
        for (let i = 0; i < 7 - remainder; i++) {
            cells.push(
                <div key={`empty-${i}`} className="calendar-cell calendar-cell-empty" />
            );
        }
    }

    return (
        <div>
            {/* Day labels */}
            <div className="calendar-grid" style={{ marginBottom: '4px' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
                    <div
                        key={i}
                        style={{
                            textAlign: 'center',
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '0.25rem 0',
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>
            <div className="calendar-grid">
                {cells}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.75rem',
                justifyContent: 'center',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', display: 'inline-block' }} />
                    No data
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(247,201,72,0.15)', border: '1px solid rgba(247,201,72,0.3)', display: 'inline-block' }} />
                    Partial
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'inline-block' }} />
                    Complete
                </span>
            </div>
        </div>
    );
};

export default CalendarView;
