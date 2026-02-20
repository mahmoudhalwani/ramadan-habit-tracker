import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Moon, LayoutDashboard, Zap } from 'lucide-react';
import { RAMADAN_DAYS, LEVELS } from './data/habits';
import { useRamadanTracker } from './hooks/useRamadanTracker';
import HabitCard from './components/HabitCard';
import DaySlider from './components/DaySlider';
import Dashboard from './components/Dashboard';
import ProgressRing from './components/ProgressRing';
import AddHabitForm from './components/AddHabitForm';

function App() {
  const {
    currentDay, setCurrentDay,
    allHabits, getHabitStatus, updateHabit,
    xp, getProgress, getStreak, getLevel,
    getAchievements, getCategoryStats,
    getTotalQuranPages, getPrayerConsistency,
    resetData, addCustomHabit, removeCustomHabit,
    data,
  } = useRamadanTracker();

  const [showDashboard, setShowDashboard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [confirmReset, setConfirmReset] = useState(false);

  // Window resize for confetti
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for daily completion — confetti
  const progress = getProgress(currentDay);
  useEffect(() => {
    if (progress === 100) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [progress, currentDay]);

  const level = getLevel();
  const streak = getStreak();

  const handleReset = () => {
    if (confirmReset) {
      resetData();
      setShowDashboard(false);
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  // Group habits by category
  const groupedHabits = allHabits.reduce((acc, h) => {
    const cat = h.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(h);
    return acc;
  }, {});

  const categoryOrder = ['prayer', 'spiritual', 'health', 'custom'];
  const categoryLabels = { prayer: '🕌 Prayers', spiritual: '📿 Spiritual', health: '💪 Health & Wellness', custom: '✨ Custom' };

  return (
    <div className="app-container" style={{ paddingBottom: '2rem' }}>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={250}
          recycle={false}
          colors={['#f7c948', '#fde68a', '#34d399', '#a78bfa', '#60a5fa', '#fb7185']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 200 }}
        />
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <div className="header-logo-icon animate-float">
            <Moon size={20} />
          </div>
          <div>
            <h1 className="header-title text-gradient-gold">Ramadan Tracker</h1>
            <p className="header-subtitle">Reflect & Grow</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={() => setShowDashboard(true)}
            title="Dashboard"
            id="open-dashboard-btn"
          >
            <LayoutDashboard size={20} />
          </button>
        </div>
      </header>

      {/* XP / Level Bar */}
      <div className="xp-bar-section">
        <div className="xp-icon">
          <Zap size={18} />
        </div>
        <div className="xp-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="xp-level-name">
              {level.current.emoji} {level.current.name}
            </span>
            <span className="xp-value">{xp} XP</span>
          </div>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${level.progress}%` }} />
          </div>
          {level.next && (
            <span className="xp-value">{level.next.minXp - xp} XP to {level.next.name}</span>
          )}
        </div>
      </div>

      {/* Day Slider */}
      <DaySlider
        currentDay={currentDay}
        onDayChange={setCurrentDay}
        days={RAMADAN_DAYS}
        getProgress={getProgress}
      />

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">
            Day {currentDay} Progress
            {streak > 1 && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--accent-rose)', fontWeight: 700 }}>
                🔥 {streak} day streak
              </span>
            )}
          </span>
          <span className="progress-value">{progress}%</span>
        </div>
        <div className="progress-bar-track">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>

      {/* Habits Grid — Grouped by Category */}
      {categoryOrder.map(cat => {
        const habits = groupedHabits[cat];
        if (!habits || habits.length === 0) return null;

        return (
          <div key={cat}>
            <div className="section-divider">
              <span className="section-divider-label">{categoryLabels[cat]}</span>
              <div className="section-divider-line" />
            </div>

            <div className="habit-grid">
              <AnimatePresence mode="popLayout">
                {habits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    layout
                  >
                    <HabitCard
                      habit={habit}
                      status={getHabitStatus(habit.id)}
                      onUpdate={(val) => updateHabit(habit.id, val, habit.type)}
                      onRemove={habit.custom ? removeCustomHabit : null}
                      day={currentDay}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      {/* Add Custom Habit */}
      <div style={{ marginTop: '1.5rem' }}>
        <AddHabitForm onAdd={addCustomHabit} />
      </div>

      {/* Dashboard Modal */}
      <AnimatePresence>
        {showDashboard && (
          <Dashboard
            data={data}
            allHabits={allHabits}
            xp={xp}
            onClose={() => setShowDashboard(false)}
            getProgress={getProgress}
            getStreak={getStreak}
            getLevel={getLevel}
            getAchievements={getAchievements}
            getCategoryStats={getCategoryStats}
            getTotalQuranPages={getTotalQuranPages}
            getPrayerConsistency={getPrayerConsistency}
            currentDay={currentDay}
            onDayChange={setCurrentDay}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
