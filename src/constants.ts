import { PlayerState } from "./types";

export const INITIAL_STATE: PlayerState = {
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 100,
  maxHp: 100,
  mp: 10,
  maxMp: 10,
  stats: {
    strength: 10,
    agility: 10,
    sense: 10,
    vitality: 10,
    intelligence: 10,
  },
  physical: {
    muscleMass: 15,
    bodyFat: 20,
    stamina: 50,
    recoveryRate: 5,
  },
  statPoints: 0,
  dailyQuests: [
    { id: 'pushups', title: 'Push-ups', target: 100, current: 0, unit: 'reps', completed: false },
    { id: 'situps', title: 'Sit-ups', target: 100, current: 0, unit: 'reps', completed: false },
    { id: 'squats', title: 'Squats', target: 100, current: 0, unit: 'reps', completed: false },
    { id: 'running', title: 'Running', target: 10, current: 0, unit: 'km', completed: false },
  ],
  milestones: [
    { id: 'm1', title: 'First Awakening', description: 'Reach Level 5', unlocked: false, requirement: 'Level 5' },
    { id: 'm2', title: 'Iron Body', description: 'Reach 30 Vitality', unlocked: false, requirement: '30 Vitality' },
    { id: 'm3', title: 'Godlike Strength', description: 'Reach 50 Strength', unlocked: false, requirement: '50 Strength' },
    { id: 'm4', title: 'Shadow Monarch Physique', description: 'Reach 40% Muscle Mass', unlocked: false, requirement: '40% Muscle Mass' },
  ],
  lastUpdate: new Date().toISOString(),
};

export const SYSTEM_COLORS = {
  primary: '#00f2ff',
  secondary: '#7000ff',
  bg: '#050505',
  panel: 'rgba(0, 20, 40, 0.8)',
  border: 'rgba(0, 242, 255, 0.3)',
};
