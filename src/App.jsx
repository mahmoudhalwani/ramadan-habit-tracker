import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Moon, LayoutDashboard, Zap } from 'lucide-react';
import { RAMADAN_DAYS, LEVELS } from './data/habits';
import { useRamadanTracker } from './hooks/useRamadanTracker';
import { useAuth } from './hooks/useAuth';
import HabitCard from './components/HabitCard';
import DaySlider from './components/DaySlider';
import Dashboard from './components/Dashboard';
import ProgressRing from './components/ProgressRing';
import AddHabitForm from './components/AddHabitForm';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import BottomNav from './components/BottomNav';
import AthkarPage from './components/AthkarPage';
import TasbihCounter from './components/TasbihCounter';

function App() {
  const {
    currentDay, setCurrentDay,
    allHabits, getHabitStatus, updateHabit,
    xp, getProgress, getStreak, getLevel,
    getAchievements, getCategoryStats,
    getTotalQuranPages, getPrayerConsistency,
    resetData, addCustomHabit, removeCustomHabit,
    data, customHabits, loadData,
  } = useRamadanTracker();

  const {
    user, loading: authLoading, syncing, syncError, lastSynced,
    loginWithGitHub, syncToGitHub, syncFromGitHub, logout,
  } = useAuth();

  const [showDashboard, setShowDashboard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [confirmReset, setConfirmReset] = useState(false);
  const [activePage, setActivePage] = useState('tracker');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (!authLoading) {
      const hasAuth = localStorage.getItem('ramadan-tracker-auth');
      const hasSkipped = localStorage.getItem('ramadan-tracker-skipped');
      if (hasAuth || hasSkipped) {
        setIsLoggedIn(true);
      }
    }
  }, [authLoading]);

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

  const handleLogin = async (token) => {
    if (token === null) {
      // Skip auth — local only mode
      localStorage.setItem('ramadan-tracker-skipped', 'true');
      setIsLoggedIn(true);
      return { success: true };
    }
    const result = await loginWithGitHub(token);
    if (result.success) {
      setIsLoggedIn(true);
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('ramadan-tracker-skipped');
    setIsLoggedIn(false);
  };

  const handleSync = async () => {
    return await syncToGitHub({ data, customHabits, xp, currentDay });
  };

  const handleRestore = async () => {
    const result = await syncFromGitHub();
    if (result.success && result.data) {
      loadData(result.data);
    }
    return result;
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

  // Show login page if not logged in
  if (!isLoggedIn && !authLoading) {
    return <LoginPage onLogin={handleLogin} loading={authLoading} />;
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="login-moon-icon animate-float">
          <Moon size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ paddingBottom: '5rem' }}>
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
          {activePage === 'tracker' && (
            <button
              className="btn-icon"
              onClick={() => setShowDashboard(true)}
              title="Dashboard"
              id="open-dashboard-btn"
            >
              <LayoutDashboard size={20} />
            </button>
          )}
        </div>
      </header>

      {/* User Profile / Sync Bar */}
      <UserProfile
        user={user}
        syncing={syncing}
        syncError={syncError}
        lastSynced={lastSynced}
        onSync={handleSync}
        onRestore={handleRestore}
        onLogout={handleLogout}
      />

      {/* Page Content */}
      <AnimatePresence mode="wait">
        {activePage === 'tracker' && (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}

        {activePage === 'athkar' && (
          <motion.div
            key="athkar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <AthkarPage />
          </motion.div>
        )}

        {activePage === 'tasbih' && (
          <motion.div
            key="tasbih"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <TasbihCounter />
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Bottom Navigation */}
      <BottomNav activePage={activePage} onPageChange={setActivePage} />
    </div>
  );
}

export default App;
