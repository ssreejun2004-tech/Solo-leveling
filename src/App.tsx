import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Eye, 
  Heart, 
  Brain, 
  Trophy, 
  ChevronRight, 
  Plus, 
  Minus,
  AlertTriangle,
  CheckCircle2,
  User,
  LayoutDashboard,
  ScrollText,
  Settings as SettingsIcon,
  Activity,
  Dna,
  Flame,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PlayerState, PlayerStats, Quest, Milestone } from './types';
import { INITIAL_STATE } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [state, setState] = useState<PlayerState>(() => {
    const saved = localStorage.getItem('shadow_monarch_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Add physical and milestones if they don't exist
      if (!parsed.physical) parsed.physical = INITIAL_STATE.physical;
      if (!parsed.milestones) parsed.milestones = INITIAL_STATE.milestones;

      // Reset daily quests if it's a new day
      const lastDate = new Date(parsed.lastUpdate).toDateString();
      const today = new Date().toDateString();
      if (lastDate !== today) {
        return {
          ...parsed,
          dailyQuests: INITIAL_STATE.dailyQuests,
          lastUpdate: new Date().toISOString()
        };
      }
      return parsed;
    }
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<'status' | 'quests' | 'inventory'>('status');
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    localStorage.setItem('shadow_monarch_state', JSON.stringify(state));
  }, [state]);

  // Calculate physical grade based on muscle mass
  const physicalGrade = useMemo(() => {
    const mm = state.physical.muscleMass;
    if (mm < 20) return { label: 'WEAKLING', color: 'text-white/40' };
    if (mm < 25) return { label: 'FIT', color: 'text-green-400' };
    if (mm < 30) return { label: 'ATHLETE', color: 'text-blue-400' };
    if (mm < 40) return { label: 'SUPERHUMAN', color: 'text-purple-400' };
    return { label: 'MONARCH PHYSIQUE', color: 'text-system-blue system-text-glow' };
  }, [state.physical.muscleMass]);

  const checkMilestones = useCallback((currentState: PlayerState) => {
    return currentState.milestones.map(m => {
      if (m.unlocked) return m;
      let unlocked = false;
      switch (m.id) {
        case 'm1': unlocked = currentState.level >= 5; break;
        case 'm2': unlocked = currentState.stats.vitality >= 30; break;
        case 'm3': unlocked = currentState.stats.strength >= 50; break;
        case 'm4': unlocked = currentState.physical.muscleMass >= 40; break;
      }
      if (unlocked) {
        // Notification logic could go here
      }
      return { ...m, unlocked };
    });
  }, []);

  const addExp = useCallback((amount: number) => {
    setState(prev => {
      let newExp = prev.exp + amount;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;
      let newStatPoints = prev.statPoints;
      let leveledUp = false;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = Math.floor(newMaxExp * 1.2);
        newStatPoints += 5;
        leveledUp = true;
      }

      if (leveledUp) {
        setShowLevelUp(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2ff', '#7000ff', '#ffffff']
        });
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      const newState = {
        ...prev,
        level: newLevel,
        exp: newExp,
        maxExp: newMaxExp,
        statPoints: newStatPoints,
        hp: prev.maxHp,
        mp: prev.maxMp
      };
      
      return { ...newState, milestones: checkMilestones(newState) };
    });
  }, [checkMilestones]);

  const updateQuest = (id: string, amount: number) => {
    setState(prev => {
      const newQuests = prev.dailyQuests.map(q => {
        if (q.id === id) {
          const newCurrent = Math.min(q.target, Math.max(0, q.current + amount));
          const newlyCompleted = !q.completed && newCurrent >= q.target;
          
          if (newlyCompleted) {
            // Trigger completion effect
            setTimeout(() => addExp(50), 0);
          }
          
          return { ...q, current: newCurrent, completed: newCurrent >= q.target };
        }
        return q;
      });
      return { ...prev, dailyQuests: newQuests };
    });
  };

  const upgradeStat = (stat: keyof PlayerStats) => {
    if (state.statPoints > 0) {
      setState(prev => {
        const newStats = {
          ...prev.stats,
          [stat]: prev.stats[stat] + 1
        };
        
        // Calculate physical improvements based on stats
        const newMuscleMass = 15 + (newStats.strength * 0.5) + (newStats.vitality * 0.2);
        const newBodyFat = Math.max(5, 20 - (newStats.agility * 0.1) - (newStats.strength * 0.05));
        const newStamina = 50 + (newStats.vitality * 5);
        const newRecoveryRate = 5 + (newStats.vitality * 0.5);

        const newState = {
          ...prev,
          statPoints: prev.statPoints - 1,
          stats: newStats,
          physical: {
            muscleMass: Number(newMuscleMass.toFixed(1)),
            bodyFat: Number(newBodyFat.toFixed(1)),
            stamina: newStamina,
            recoveryRate: newRecoveryRate,
          },
          maxHp: stat === 'vitality' ? prev.maxHp + 20 : prev.maxHp,
          maxMp: stat === 'intelligence' ? prev.maxMp + 5 : prev.maxMp
        };

        return { ...newState, milestones: checkMilestones(newState) };
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline" />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-system-blue/10" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-system-blue/10" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-system-blue/10" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-system-blue/10" />
      </div>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl z-10"
      >
        {/* Header / Top Bar */}
        <div className="flex items-end justify-between mb-6 px-4">
          <div className="flex flex-col">
            <span className="text-xs text-system-blue/60 uppercase tracking-widest mb-1">Player Status</span>
            <h1 className="text-4xl font-bold italic tracking-tighter system-text-glow">
              SUNG JIN-WOO <span className="text-system-blue text-lg not-italic ml-2">LV.{state.level}</span>
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex gap-4 mb-2">
              <div className="text-right">
                <div className="text-[10px] text-system-blue/60 uppercase">HP</div>
                <div className="text-xl font-bold">{state.hp} / {state.maxHp}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-system-purple/60 uppercase">MP</div>
                <div className="text-xl font-bold text-system-purple">{state.mp} / {state.maxMp}</div>
              </div>
            </div>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-system-blue shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${(state.exp / state.maxExp) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6 px-4">
          {[
            { id: 'status', label: 'STATUS', icon: User },
            { id: 'quests', label: 'QUESTS', icon: ScrollText },
            { id: 'inventory', label: 'INVENTORY', icon: LayoutDashboard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2 border transition-all duration-300",
                activeTab === tab.id 
                  ? "bg-system-blue/20 border-system-blue text-system-blue system-border-glow" 
                  : "bg-black/40 border-white/10 text-white/40 hover:text-white/80"
              )}
            >
              <tab.icon size={16} />
              <span className="text-sm font-bold tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'status' && (
              <motion.div 
                key="status"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Stats Panel */}
                <div className="system-panel p-6 relative overflow-hidden lg:col-span-1">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Shield size={120} />
                  </div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-system-blue">
                    <Zap size={18} /> ABILITIES
                    {state.statPoints > 0 && (
                      <span className="ml-auto text-xs bg-system-blue text-black px-2 py-0.5 rounded animate-pulse">
                        {state.statPoints} P
                      </span>
                    )}
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'strength', label: 'STRENGTH', icon: Zap, color: 'text-orange-400' },
                      { key: 'agility', label: 'AGILITY', icon: ChevronRight, color: 'text-green-400' },
                      { key: 'sense', label: 'SENSE', icon: Eye, color: 'text-blue-400' },
                      { key: 'vitality', label: 'VITALITY', icon: Heart, color: 'text-red-400' },
                      { key: 'intelligence', label: 'INTELLIGENCE', icon: Brain, color: 'text-purple-400' },
                    ].map((stat) => (
                      <div key={stat.key} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 bg-white/5 rounded", stat.color)}>
                            <stat.icon size={16} />
                          </div>
                          <span className="text-sm font-bold tracking-wider opacity-80">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-mono font-bold">{state.stats[stat.key as keyof PlayerStats]}</span>
                          {state.statPoints > 0 && (
                            <button 
                              onClick={() => upgradeStat(stat.key as keyof PlayerStats)}
                              className="w-6 h-6 flex items-center justify-center border border-system-blue/50 text-system-blue hover:bg-system-blue hover:text-black transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physical Growth Panel */}
                <div className="system-panel p-6 lg:col-span-1">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-system-blue">
                    <Dna size={18} /> PHYSICAL GROWTH
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs text-white/40 uppercase tracking-widest">Physical Grade</span>
                        <span className={cn("text-lg font-black italic", physicalGrade.color)}>{physicalGrade.label}</span>
                      </div>
                      <div className="text-[10px] text-white/20 uppercase">Based on muscle mass and overall stats</div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">MUSCLE MASS</span>
                          <span className="font-bold text-system-blue">{state.physical.muscleMass}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-system-blue shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(state.physical.muscleMass / 50) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">BODY FAT</span>
                          <span className="font-bold text-red-400">{state.physical.bodyFat}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-red-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${(state.physical.bodyFat / 30) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-white/5 rounded">
                          <div className="flex items-center gap-2 text-orange-400 mb-1">
                            <Flame size={12} />
                            <span className="text-[10px] font-bold uppercase">Stamina</span>
                          </div>
                          <div className="text-xl font-bold">{state.physical.stamina}</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded">
                          <div className="flex items-center gap-2 text-green-400 mb-1">
                            <Activity size={12} />
                            <span className="text-[10px] font-bold uppercase">Recovery</span>
                          </div>
                          <div className="text-xl font-bold">+{state.physical.recoveryRate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones Panel */}
                <div className="system-panel p-6 lg:col-span-1">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-system-blue">
                    <TrendingUp size={18} /> MILESTONES
                  </h3>
                  <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    {state.milestones.map((m) => (
                      <div 
                        key={m.id} 
                        className={cn(
                          "p-3 border transition-all duration-300",
                          m.unlocked 
                            ? "bg-system-blue/10 border-system-blue/50" 
                            : "bg-white/5 border-white/10 opacity-50"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={cn("text-sm font-bold tracking-tight", m.unlocked ? "text-system-blue" : "text-white/60")}>
                            {m.title}
                          </span>
                          {m.unlocked && <CheckCircle2 size={14} className="text-system-blue" />}
                        </div>
                        <p className="text-[10px] text-white/40 leading-tight mb-2">{m.description}</p>
                        {!m.unlocked && (
                          <div className="text-[9px] font-mono text-white/20 uppercase">REQ: {m.requirement}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quests' && (
              <motion.div 
                key="quests"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="col-span-12"
              >
                <div className="system-panel p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tighter system-text-glow">DAILY QUEST: PREPARATIONS TO BECOME STRONG</h2>
                      <p className="text-sm text-white/40 mt-1 uppercase tracking-widest italic">Goal: Complete all physical training tasks</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/40 uppercase">Time Remaining</div>
                      <div className="text-xl font-mono font-bold text-system-blue">14:22:05</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {state.dailyQuests.map((quest) => (
                      <div key={quest.id} className="relative group">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-3">
                            {quest.completed ? (
                              <CheckCircle2 className="text-system-blue" size={20} />
                            ) : (
                              <div className="w-5 h-5 border border-white/20 rounded-sm" />
                            )}
                            <span className={cn(
                              "font-bold tracking-wider",
                              quest.completed ? "text-system-blue" : "text-white/80"
                            )}>
                              {quest.title.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-mono">
                            <span className="text-lg font-bold">{quest.current}</span>
                            <span className="text-white/40 ml-1">/ {quest.target} {quest.unit}</span>
                          </div>
                        </div>
                        
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                          <motion.div 
                            className={cn(
                              "h-full transition-all duration-500",
                              quest.completed ? "bg-system-blue shadow-[0_0_10px_rgba(0,242,255,0.5)]" : "bg-white/20"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${(quest.current / quest.target) * 100}%` }}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateQuest(quest.id, 1)}
                            className="flex-1 py-1 bg-white/5 hover:bg-system-blue/20 border border-white/10 hover:border-system-blue/50 transition-all flex items-center justify-center gap-1"
                          >
                            <Plus size={14} /> <span className="text-[10px] font-bold">ADD 1</span>
                          </button>
                          <button 
                            onClick={() => updateQuest(quest.id, 10)}
                            className="flex-1 py-1 bg-white/5 hover:bg-system-blue/20 border border-white/10 hover:border-system-blue/50 transition-all flex items-center justify-center gap-1"
                          >
                            <Plus size={14} /> <span className="text-[10px] font-bold">ADD 10</span>
                          </button>
                          <button 
                            onClick={() => updateQuest(quest.id, -1)}
                            className="px-3 py-1 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 transition-all flex items-center justify-center"
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 p-6 bg-system-blue/5 border border-system-blue/20 rounded">
                    <h4 className="text-sm font-bold text-system-blue mb-2 uppercase tracking-widest">Quest Rewards</h4>
                    <ul className="text-xs space-y-2 text-white/60">
                      <li className="flex items-center gap-2">• Full recovery of physical condition</li>
                      <li className="flex items-center gap-2">• Stat points: +3</li>
                      <li className="flex items-center gap-2">• Random Loot Box: x1</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="col-span-12"
              >
                <div className="system-panel p-8">
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-system-blue">
                    <LayoutDashboard size={24} /> INVENTORY
                  </h2>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {[
                      { name: "Kasaka's Venom Gland", rarity: 'S', icon: '🧪' },
                      { name: "Knight Killer", rarity: 'B', icon: '🗡️' },
                      { name: "Teleportation Stone", rarity: 'A', icon: '💎' },
                      { name: "High-Grade Health Potion", rarity: 'C', icon: '🧪' },
                      ...Array(20).fill(null)
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "aspect-square border border-white/10 bg-white/5 flex items-center justify-center relative group cursor-pointer hover:border-system-blue/50 transition-all",
                          item && "bg-gradient-to-br from-white/10 to-transparent"
                        )}
                      >
                        {item ? (
                          <>
                            <span className="text-2xl">{item.icon}</span>
                            <div className="absolute top-1 right-1 text-[8px] font-bold text-system-blue">{item.rarity}</div>
                            <div className="absolute inset-0 bg-system-blue/0 group-hover:bg-system-blue/10 transition-colors" />
                          </>
                        ) : (
                          <div className="w-2 h-2 bg-white/10 rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <div className="text-center">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-8xl font-black italic text-system-blue system-text-glow mb-4"
              >
                LEVEL UP!
              </motion.div>
              <div className="text-2xl font-bold tracking-widest text-white/80">
                YOU HAVE BECOME STRONGER
              </div>
              <div className="mt-8 flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-white/40 uppercase">Previous</div>
                  <div className="text-4xl font-bold">LV.{state.level - 1}</div>
                </div>
                <div className="flex items-center text-system-blue">
                  <ChevronRight size={48} />
                </div>
                <div className="text-center">
                  <div className="text-xs text-system-blue/40 uppercase">Current</div>
                  <div className="text-4xl font-bold text-system-blue">LV.{state.level}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer System Message */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none opacity-40">
        <div className="text-[10px] font-mono">
          SYSTEM_VERSION: 1.0.4_SHADOW<br />
          CONNECTION: STABLE<br />
          SYNC_STATUS: ACTIVE
        </div>
        <div className="text-[10px] font-mono text-right">
          [SYSTEM WARNING]<br />
          DO NOT NEGLECT YOUR TRAINING.<br />
          THE MONARCH IS WATCHING.
        </div>
      </div>
    </div>
  );
}
