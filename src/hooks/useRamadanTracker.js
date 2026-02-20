import { useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_HABITS, LEVELS, ACHIEVEMENTS } from '../data/habits';

const STORAGE_KEY = 'ramadan-tracker-v2';

export const useRamadanTracker = () => {
    const [currentDay, setCurrentDay] = useState(1);
    const [data, setData] = useState({});
    const [customHabits, setCustomHabits] = useState([]);
    const [xp, setXp] = useState(0);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setData(parsed.data || {});
                setCustomHabits(parsed.customHabits || []);
                setXp(parsed.xp || 0);
                if (parsed.currentDay) setCurrentDay(parsed.currentDay);
            } catch (e) {
                console.error("Failed to load data", e);
            }
        }
    }, []);

    // Save to local storage whenever state changes
    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, customHabits, xp, currentDay }));
        }, 300);
        return () => clearTimeout(saveTimeout);
    }, [data, customHabits, xp, currentDay]);

    // Combine defaults and custom habits
    const allHabits = useMemo(() => [...DEFAULT_HABITS, ...customHabits], [customHabits]);

    const getDayData = useCallback((day) => data[`day-${day}`] || {}, [data]);

    const updateHabit = useCallback((habitId, value, type) => {
        setData(prev => {
            const dayKey = `day-${currentDay}`;
            const dayData = prev[dayKey] || {};
            const habit = allHabits.find(h => h.id === habitId);

            // Calculate XP diff
            let xpDiff = 0;
            const reward = habit?.xpReward || 10;

            if (type === 'boolean') {
                const oldVal = dayData[habitId] || false;
                if (value && !oldVal) xpDiff = reward;
                if (!value && oldVal) xpDiff = -reward;
            } else if (type === 'counter') {
                const oldVal = dayData[habitId] || 0;
                xpDiff = (value - oldVal) * reward;
            }

            setXp(x => Math.max(0, x + xpDiff));

            return {
                ...prev,
                [dayKey]: {
                    ...dayData,
                    [habitId]: value
                }
            };
        });
    }, [currentDay, allHabits]);

    const getHabitStatus = useCallback((habitId) => {
        const dayData = getDayData(currentDay);
        return dayData[habitId];
    }, [currentDay, getDayData]);

    // Add a custom habit
    const addCustomHabit = useCallback((name) => {
        if (!name.trim()) return;
        const id = 'custom_' + Date.now();
        setCustomHabits(prev => [
            ...prev,
            { id, name: name.trim(), icon: 'Star', category: 'custom', type: 'boolean', xpReward: 10, custom: true }
        ]);
    }, []);

    // Remove a custom habit
    const removeCustomHabit = useCallback((habitId) => {
        setCustomHabits(prev => prev.filter(h => h.id !== habitId));
        // Remove habit data from all days
        setData(prev => {
            const newData = { ...prev };
            Object.keys(newData).forEach(dayKey => {
                if (newData[dayKey][habitId] !== undefined) {
                    const { [habitId]: _, ...rest } = newData[dayKey];
                    newData[dayKey] = rest;
                }
            });
            return newData;
        });
    }, []);

    const resetData = useCallback(() => {
        setData({});
        setXp(0);
        setCustomHabits([]);
        setCurrentDay(1);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Progress for a single day
    const getProgress = useCallback((day) => {
        const dayData = data[`day-${day}`] || {};
        let completed = 0;
        const total = allHabits.length;
        if (total === 0) return 0;

        allHabits.forEach(h => {
            const val = dayData[h.id];
            if (h.type === 'boolean' && val) completed++;
            if (h.type === 'counter' && (val || 0) >= (h.target || 1)) completed++;
        });

        return Math.round((completed / total) * 100);
    }, [data, allHabits]);

    // Streak calculation
    const getStreak = useCallback(() => {
        let streak = 0;
        for (let d = currentDay; d >= 1; d--) {
            const dayData = data[`day-${d}`] || {};
            const hasActivity = Object.values(dayData).some(v => v);
            if (hasActivity) streak++;
            else break;
        }
        return streak;
    }, [data, currentDay]);

    // Level calculation
    const getLevel = useCallback(() => {
        let currentLevel = LEVELS[0];
        let nextLevel = LEVELS[1] || null;
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (xp >= LEVELS[i].minXp) {
                currentLevel = LEVELS[i];
                nextLevel = LEVELS[i + 1] || null;
                break;
            }
        }
        const progress = nextLevel
            ? ((xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100
            : 100;
        return { current: currentLevel, next: nextLevel, progress: Math.min(100, progress) };
    }, [xp]);

    // Unlocked achievements
    const getAchievements = useCallback(() => {
        return ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: a.check(data, allHabits),
        }));
    }, [data, allHabits]);

    // Category stats (for dashboard)
    const getCategoryStats = useCallback(() => {
        const categories = { prayer: { total: 0, completed: 0 }, spiritual: { total: 0, completed: 0 }, health: { total: 0, completed: 0 }, custom: { total: 0, completed: 0 } };

        for (let d = 1; d <= 30; d++) {
            const dayData = data[`day-${d}`] || {};
            allHabits.forEach(h => {
                const cat = h.category;
                categories[cat].total++;
                const val = dayData[h.id];
                if (h.type === 'boolean' && val) categories[cat].completed++;
                if (h.type === 'counter' && (val || 0) >= (h.target || 1)) categories[cat].completed++;
            });
        }

        return Object.entries(categories).map(([key, val]) => ({
            category: key,
            percentage: val.total === 0 ? 0 : Math.round((val.completed / val.total) * 100),
        }));
    }, [data, allHabits]);

    // Total Quran pages
    const getTotalQuranPages = useCallback(() => {
        return Object.values(data).reduce((sum, dayData) => sum + (dayData.quran || 0), 0);
    }, [data]);

    // Prayer consistency (how many days had all 5 prayers)
    const getPrayerConsistency = useCallback(() => {
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        let fullDays = 0;
        for (let d = 1; d <= 30; d++) {
            const dayData = data[`day-${d}`] || {};
            if (prayers.every(p => dayData[p])) fullDays++;
        }
        return fullDays;
    }, [data]);

    return {
        currentDay,
        setCurrentDay,
        allHabits,
        getHabitStatus,
        updateHabit,
        xp,
        getProgress,
        getStreak,
        getLevel,
        getAchievements,
        getCategoryStats,
        getTotalQuranPages,
        getPrayerConsistency,
        resetData,
        addCustomHabit,
        removeCustomHabit,
        data,
        customHabits,
    };
};
