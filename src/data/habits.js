export const DEFAULT_HABITS = [
  // Prayers
  { id: 'fajr', name: 'Fajr', icon: 'Sunrise', category: 'prayer', type: 'boolean', xpReward: 15 },
  { id: 'dhuhr', name: 'Dhuhr', icon: 'Sun', category: 'prayer', type: 'boolean', xpReward: 10 },
  { id: 'asr', name: 'Asr', icon: 'CloudSun', category: 'prayer', type: 'boolean', xpReward: 10 },
  { id: 'maghrib', name: 'Maghrib', icon: 'Sunset', category: 'prayer', type: 'boolean', xpReward: 10 },
  { id: 'isha', name: 'Isha', icon: 'Moon', category: 'prayer', type: 'boolean', xpReward: 15 },

  // Spiritual
  { id: 'quran', name: 'Quran Reading', icon: 'BookOpen', category: 'spiritual', type: 'counter', unit: 'pages', target: 20, xpReward: 2 },
  { id: 'dhikr', name: 'Dhikr', icon: 'Heart', category: 'spiritual', type: 'boolean', xpReward: 10 },
  { id: 'charity', name: 'Charity (Sadaqah)', icon: 'HandHeart', category: 'spiritual', type: 'boolean', xpReward: 20 },

  // Health
  { id: 'water', name: 'Water Intake', icon: 'Droplets', category: 'health', type: 'counter', unit: 'glasses', target: 8, xpReward: 1 },
  { id: 'workout', name: 'Workout', icon: 'Dumbbell', category: 'health', type: 'boolean', xpReward: 15 },
  { id: 'sleep', name: 'Sleep Hours', icon: 'BedDouble', category: 'health', type: 'counter', unit: 'hours', target: 7, xpReward: 2 },
];

export const RAMADAN_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

export const LEVELS = [
  { name: 'Beginner', minXp: 0, emoji: '🌱' },
  { name: 'Focused', minXp: 80, emoji: '🎯' },
  { name: 'Consistent', minXp: 250, emoji: '⭐' },
  { name: 'Disciplined', minXp: 500, emoji: '🔥' },
  { name: 'Devoted', minXp: 900, emoji: '💎' },
  { name: 'Ramadan Warrior', minXp: 1500, emoji: '⚔️' },
  { name: 'Legend', minXp: 2500, emoji: '👑' },
];

export const ACHIEVEMENTS = [
  {
    id: 'first_prayer', name: 'First Prayer', desc: 'Complete your first prayer', icon: '🕌', check: (data) => {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      return Object.values(data).some(day => prayers.some(p => day[p]));
    }
  },
  {
    id: 'fajr_3', name: 'Fajr Guardian', desc: 'Pray Fajr for 3 days', icon: '🌅', check: (data) => {
      return Object.values(data).filter(day => day.fajr).length >= 3;
    }
  },
  {
    id: 'fajr_7', name: 'Dawn Warrior', desc: 'Pray Fajr for 7 days', icon: '🌄', check: (data) => {
      return Object.values(data).filter(day => day.fajr).length >= 7;
    }
  },
  {
    id: 'all_prayers', name: 'Prayer Master', desc: 'Complete all 5 prayers in a day', icon: '🕋', check: (data) => {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      return Object.values(data).some(day => prayers.every(p => day[p]));
    }
  },
  {
    id: 'quran_50', name: 'Quran Explorer', desc: 'Read 50 pages total', icon: '📖', check: (data) => {
      const total = Object.values(data).reduce((s, d) => s + (d.quran || 0), 0);
      return total >= 50;
    }
  },
  {
    id: 'quran_200', name: 'Quran Scholar', desc: 'Read 200 pages total', icon: '📚', check: (data) => {
      const total = Object.values(data).reduce((s, d) => s + (d.quran || 0), 0);
      return total >= 200;
    }
  },
  {
    id: 'hydration', name: 'Hydration Hero', desc: 'Drink 8 glasses for 5 days', icon: '💧', check: (data) => {
      return Object.values(data).filter(day => (day.water || 0) >= 8).length >= 5;
    }
  },
  {
    id: 'charity_5', name: 'Generous Soul', desc: 'Give charity for 5 days', icon: '💝', check: (data) => {
      return Object.values(data).filter(day => day.charity).length >= 5;
    }
  },
  {
    id: 'perfect_day', name: 'Perfect Day', desc: 'Complete all habits in a single day', icon: '✨', check: (data, allHabits) => {
      return Object.values(data).some(dayData => {
        return allHabits.every(h => {
          if (h.type === 'boolean') return dayData[h.id];
          if (h.type === 'counter') return (dayData[h.id] || 0) >= (h.target || 1);
          return false;
        });
      });
    }
  },
  {
    id: 'streak_7', name: '7-Day Streak', desc: 'Have active progress for 7 consecutive days', icon: '🔥', check: (data) => {
      let maxStreak = 0, current = 0;
      for (let d = 1; d <= 30; d++) {
        const dayData = data[`day-${d}`] || {};
        const hasAny = Object.values(dayData).some(v => v);
        if (hasAny) { current++; maxStreak = Math.max(maxStreak, current); }
        else { current = 0; }
      }
      return maxStreak >= 7;
    }
  },
  {
    id: 'workout_10', name: 'Fitness Enthusiast', desc: 'Work out 10 days', icon: '💪', check: (data) => {
      return Object.values(data).filter(day => day.workout).length >= 10;
    }
  },
  {
    id: 'half_ramadan', name: 'Halfway There', desc: 'Track habits for 15 days', icon: '🏆', check: (data) => {
      let daysActive = 0;
      for (let d = 1; d <= 30; d++) {
        const dayData = data[`day-${d}`] || {};
        if (Object.values(dayData).some(v => v)) daysActive++;
      }
      return daysActive >= 15;
    }
  },
];

export const CATEGORY_COLORS = {
  prayer: { bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.2)', text: '#34d399' },
  spiritual: { bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa' },
  health: { bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.2)', text: '#fb7185' },
  custom: { bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa' },
};
