import React, { useState, useMemo } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
    Trophy, Star, TrendingUp, Award, Flame, BookOpen,
    X, Calendar, BarChart3, Medal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_COLORS } from '../data/habits';
import CalendarView from './CalendarView';
import ProgressRing from './ProgressRing';

/* ----- Custom Recharts Tooltip ----- */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="custom-tooltip-label">Day {label}</p>
                <p className="custom-tooltip-value">{payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

/* ----- Stat Card ----- */
const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ background: bgColor, color }}>
            <Icon size={20} />
        </div>
        <div>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
        </div>
    </div>
);

/* ----- Focus Bar ----- */
const FocusBar = ({ label, value, color }) => (
    <div style={{ marginBottom: '0.6rem' }}>
        <div className="focus-bar-label">
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
            <span style={{ color: 'var(--text-muted)' }}>{value}%</span>
        </div>
        <div className="focus-bar-track">
            <div className="focus-bar-fill" style={{ width: `${value}%`, background: color }} />
        </div>
    </div>
);

/* ----- Dashboard Component ----- */
const Dashboard = ({
    data, allHabits, xp, onClose, getProgress,
    getStreak, getLevel, getAchievements,
    getCategoryStats, getTotalQuranPages, getPrayerConsistency,
    currentDay, onDayChange, onReset,
}) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Chart data
    const chartData = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => {
            const day = i + 1;
            return { name: `${day}`, score: getProgress(day) };
        });
    }, [data, getProgress]);

    // Prayer chart data
    const prayerChartData = useMemo(() => {
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        return prayers.map(p => {
            const count = Object.values(data).filter(d => d[p]).length;
            return { name: p.charAt(0).toUpperCase() + p.slice(1), count, fill: '#34d399' };
        });
    }, [data]);

    const streak = getStreak();
    const level = getLevel();
    const achievements = getAchievements();
    const categoryStats = getCategoryStats();
    const totalPages = getTotalQuranPages();
    const prayerDays = getPrayerConsistency();
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    const avgScore = useMemo(() => {
        const activeDays = chartData.filter(d => d.score > 0);
        if (activeDays.length === 0) return 0;
        return Math.round(activeDays.reduce((s, d) => s + d.score, 0) / activeDays.length);
    }, [chartData]);

    const categoryColorMap = {
        prayer: '#34d399',
        spiritual: '#60a5fa',
        health: '#fb7185',
        custom: '#a78bfa',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="modal-content"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                            <span className="text-gradient-gold">Your Journey</span>
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ramadan Progress Dashboard</p>
                    </div>
                    <button className="modal-close" onClick={onClose} id="close-dashboard-btn">
                        <X size={18} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="tab-nav" style={{ marginBottom: '1.25rem' }}>
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'charts', label: 'Charts' },
                        { key: 'achievements', label: 'Badges' },
                        { key: 'calendar', label: 'Calendar' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                            id={`tab-${tab.key}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* --- OVERVIEW TAB --- */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Stat Cards */}
                            <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
                                <StatCard icon={Trophy} label="Total XP" value={xp} color="#f7c948" bgColor="rgba(247,201,72,0.1)" />
                                <StatCard icon={Flame} label="Streak" value={`${streak} days`} color="#fb7185" bgColor="rgba(251,113,133,0.1)" />
                                <StatCard icon={TrendingUp} label="Avg Score" value={`${avgScore}%`} color="#60a5fa" bgColor="rgba(96,165,250,0.1)" />
                                <StatCard icon={Medal} label="Badges" value={`${unlockedCount}/${achievements.length}`} color="#34d399" bgColor="rgba(52,211,153,0.1)" />
                            </div>

                            {/* Level & XP */}
                            <div className="chart-container" style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <ProgressRing progress={level.progress} size={64} strokeWidth={5} color="#a78bfa" />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '1.1rem' }}>{level.current.emoji}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                                                {level.current.name}
                                            </span>
                                        </div>
                                        <div className="xp-bar-track" style={{ marginBottom: '0.25rem' }}>
                                            <div className="xp-bar-fill" style={{ width: `${level.progress}%` }} />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {xp} XP {level.next ? `· ${level.next.minXp - xp} XP to ${level.next.name}` : '· Max Level!'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Focus Areas */}
                            <div className="chart-container">
                                <h3 className="chart-title">
                                    <BarChart3 size={18} style={{ color: 'var(--accent-gold)' }} />
                                    Focus Areas
                                </h3>
                                {categoryStats.map(cat => (
                                    <FocusBar
                                        key={cat.category}
                                        label={cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                                        value={cat.percentage}
                                        color={categoryColorMap[cat.category]}
                                    />
                                ))}
                            </div>

                            {/* Additional Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                                <div className="chart-container" style={{ marginBottom: 0, textAlign: 'center' }}>
                                    <BookOpen size={24} style={{ color: '#60a5fa', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalPages}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quran Pages</div>
                                </div>
                                <div className="chart-container" style={{ marginBottom: 0, textAlign: 'center' }}>
                                    <Star size={24} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{prayerDays}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>All-5-Prayers Days</div>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <button className="btn-danger" onClick={onReset} id="reset-ramadan-btn">
                                    Reset Ramadan
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* --- CHARTS TAB --- */}
                    {activeTab === 'charts' && (
                        <motion.div
                            key="charts"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Consistency Trend */}
                            <div className="chart-container" style={{ marginBottom: '1rem' }}>
                                <h3 className="chart-title">
                                    <TrendingUp size={18} style={{ color: 'var(--accent-gold)' }} />
                                    Daily Completion Trend
                                </h3>
                                <div style={{ height: 220, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f7c948" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f7c948" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 11 }} />
                                            <YAxis stroke="#64748b" tickLine={false} axisLine={false} unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f7c948', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                            <Area type="monotone" dataKey="score" stroke="#f7c948" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" dot={false} activeDot={{ r: 5, stroke: '#f7c948', fill: '#0a0e1a', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Prayer Consistency Bar Chart */}
                            <div className="chart-container">
                                <h3 className="chart-title">
                                    <Star size={18} style={{ color: '#34d399' }} />
                                    Prayer Consistency (days completed)
                                </h3>
                                <div style={{ height: 200, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={prayerChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                            <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                            <Tooltip content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="custom-tooltip">
                                                            <p className="custom-tooltip-label">{label}</p>
                                                            <p className="custom-tooltip-value">{payload[0].value} days</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- ACHIEVEMENTS TAB --- */}
                    {activeTab === 'achievements' && (
                        <motion.div
                            key="achievements"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {unlockedCount} of {achievements.length} badges unlocked
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {achievements.map((a, i) => (
                                    <motion.div
                                        key={a.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={`badge-item ${a.unlocked ? 'badge-item-active' : 'badge-item-locked'}`}
                                    >
                                        <div className={`badge-icon ${a.unlocked ? 'badge-icon-active' : 'badge-icon-locked'}`}>
                                            <span style={{ fontSize: '1rem' }}>{a.icon}</span>
                                        </div>
                                        <div>
                                            <div className="badge-name">{a.name}</div>
                                            <div className="badge-desc">{a.desc}</div>
                                        </div>
                                        {a.unlocked && (
                                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                                                UNLOCKED
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* --- CALENDAR TAB --- */}
                    {activeTab === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="chart-container">
                                <h3 className="chart-title">
                                    <Calendar size={18} style={{ color: 'var(--accent-gold)' }} />
                                    Ramadan Calendar
                                </h3>
                                <CalendarView
                                    data={data}
                                    getProgress={getProgress}
                                    currentDay={currentDay}
                                    onDayChange={(d) => { onDayChange(d); onClose(); }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
