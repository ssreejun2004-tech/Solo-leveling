export interface PlayerStats {
  strength: number;
  agility: number;
  sense: number;
  vitality: number;
  intelligence: number;
}

export interface PhysicalGrowth {
  muscleMass: number; // Percentage 0-100
  bodyFat: number; // Percentage
  stamina: number; // Max stamina for activities
  recoveryRate: number; // HP/MP recovery per hour
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  requirement: string;
}

export interface Quest {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export interface PlayerState {
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: PlayerStats;
  physical: PhysicalGrowth;
  statPoints: number;
  dailyQuests: Quest[];
  milestones: Milestone[];
  lastUpdate: string; // ISO date
}
