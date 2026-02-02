
import React, { useMemo } from 'react';
import { View, JournalEntry, Habit, NutritionGoals } from '../types';
import { MoreHorizontal, Info, Activity, Moon, Battery, ChevronRight, Smile, Trash2, Zap, BarChart3, TrendingUp, Sparkles, Target } from 'lucide-react';

interface RightSidebarProps {
  currentView: View;
  onLogMeal?: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  hasData?: boolean;
  journalEntries?: JournalEntry[];
  onAddJournalEntry?: (entry: JournalEntry) => void;
  habits?: Habit[];
  todaysTotals?: { calories: number; protein: number; carbs: number; fats: number };
  nutritionGoals?: NutritionGoals;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
    currentView, 
    onLogMeal, 
    showToast, 
    journalEntries = [], 
    onAddJournalEntry,
    habits = [],
    todaysTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 },
    nutritionGoals = { calories: 2000, protein: 150, carbs: 250, fats: 65 }
}) => {
  
  const habitCompletionRate = useMemo(() => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(h => h.completed).length;
    return Math.round((completed / habits.length) * 100);
  }, [habits]);

  const healthScore = useMemo(() => {
    // Nutrition Score (Weight 60)
    const nutritionRatio = Math.min(1.2, todaysTotals.calories / (nutritionGoals.calories || 1));
    let nutritionPoints = 0;
    if (nutritionRatio >= 0.8 && nutritionRatio <= 1.1) nutritionPoints = 60;
    else if (nutritionRatio > 0 && nutritionRatio < 0.8) nutritionPoints = 60 * (nutritionRatio / 0.8);
    else if (nutritionRatio > 1.1) nutritionPoints = Math.max(20, 60 - (nutritionRatio - 1.1) * 40);

    // Habit Score (Weight 40)
    const habitPoints = (habitCompletionRate / 100) * 40;
    
    return Math.round(nutritionPoints + habitPoints);
  }, [todaysTotals, nutritionGoals, habitCompletionRate]);

  const handleMoodLog = (moodStr: 'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Stressed', emoji: string) => {
    if (onAddJournalEntry) {
        onAddJournalEntry({
            id: Date.now().toString(),
            title: `Atmosphere Pulse: ${moodStr}`,
            content: `Interactive bio-state snapshot logged via primary sidebar interface. Frequency: ${moodStr.toUpperCase()}.`,
            mood: moodStr,
            timestamp: new Date()
        });
        showToast(`Pulse Recorded: ${emoji}`);
    }
  };

  const moodChartData = useMemo(() => {
    const counts: Record<string, number> = { 'Happy': 0, 'Calm': 0, 'Neutral': 0, 'Stressed': 0, 'Sad': 0 };
    journalEntries.forEach(entry => {
        if (counts[entry.mood] !== undefined) counts[entry.mood]++;
    });
    return counts;
  }, [journalEntries]);

  const maxCount = Math.max(...(Object.values(moodChartData) as number[]), 1);

  // --- NUTRITION VIEW ---
  if (currentView === 'nutrition') {
    return (
      <div className="w-80 bg-slate-900 h-screen border-l border-white/5 p-8 fixed right-0 top-0 overflow-y-auto hidden xl:block z-30 shadow-2xl shadow-indigo-950/20 scrollbar-hide">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-black text-slate-100 text-xs uppercase tracking-widest">Progress Map</h2>
          <button onClick={() => showToast("Parsing deep biome analytics...")} className="text-slate-700 hover:text-indigo-400 transition-colors"><MoreHorizontal size={24} /></button>
        </div>

        <div className="bg-slate-950 rounded-[40px] p-8 mb-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <h3 className="text-indigo-500 font-black text-[9px] uppercase tracking-widest mb-8 flex items-center gap-2"><Target size={14}/> Intake Sequence</h3>
            <div className="space-y-8">
                {[
                    { label: 'Calories', current: todaysTotals.calories, target: nutritionGoals.calories, color: 'bg-emerald-500', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]' },
                    { label: 'Protein', current: todaysTotals.protein, target: nutritionGoals.protein, color: 'bg-indigo-500', glow: 'shadow-[0_0_12px_rgba(99,102,241,0.5)]' },
                    { label: 'Carbs', current: todaysTotals.carbs, target: nutritionGoals.carbs, color: 'bg-amber-500', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]' },
                    { label: 'Fats', current: todaysTotals.fats, target: nutritionGoals.fats, color: 'bg-rose-500', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.5)]' },
                ].map(macro => (
                    <div key={macro.label}>
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 mb-3 tracking-wider">
                            <span>{macro.label}</span>
                            <span className="text-slate-300">{Math.round((macro.current / (macro.target || 1)) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden shadow-inner border border-white/5">
                            <div className={`${macro.color} ${macro.glow} h-full transition-all duration-[1500ms] ease-out`} style={{width: `${Math.min(100, (macro.current/(macro.target || 1))*100)}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-[40px] group hover:border-indigo-500/30 transition-all bg-slate-950/50">
            <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-700 mb-6 group-hover:scale-110 transition-transform shadow-2xl border border-white/5">
                <Activity size={36} className="text-indigo-600/50" />
            </div>
            <h3 className="font-black text-slate-100 text-[10px] uppercase tracking-widest">Scanner IDLE</h3>
            <p className="text-[10px] text-slate-500 mt-3 px-10 leading-relaxed font-bold uppercase tracking-widest">Ready for intake digitization protocol.</p>
        </div>

        <div className="mt-12">
            <button 
                onClick={() => {
                   if (onLogMeal) onLogMeal();
                }}
                className="w-full py-5 bg-white text-slate-950 rounded-[24px] font-black text-[10px] uppercase tracking-widest mb-6 flex items-center justify-center gap-3 hover:bg-indigo-400 transition-all shadow-2xl active:scale-95"
            >
                Initialize Scan
            </button>
            <p className="text-[9px] text-center text-slate-700 font-black uppercase tracking-widest opacity-40">System Core 3.4 Active</p>
        </div>
      </div>
    );
  }

  // --- SETTINGS VIEW ---
  if (currentView === 'settings') {
        return (
            <div className="w-80 bg-slate-900 h-screen border-l border-white/5 p-8 fixed right-0 top-0 overflow-y-auto hidden xl:block z-30 shadow-2xl shadow-indigo-950/20 scrollbar-hide">
                <h2 className="font-black text-slate-100 text-xs uppercase tracking-widest mb-12">Registry Status</h2>
                
                <div className="bg-slate-950 rounded-[40px] p-8 text-white mb-10 relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-[100px] -mr-24 -mt-24"></div>
                    <div className="flex justify-between items-start mb-12">
                        <div className="relative z-10">
                            <p className="text-[9px] text-indigo-500 uppercase font-black tracking-widest mb-3">Health Quota</p>
                            <div className="flex items-end gap-2">
                                <span className="text-7xl font-black tracking-tighter leading-none tabular-nums text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-pink-500">{healthScore}</span>
                                <span className="text-[10px] font-black text-slate-700 mb-2 uppercase">/100</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-xl"><Activity className="text-indigo-600" size={28} /></div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-900 rounded-xl text-indigo-400 border border-white/5"><Moon size={18} /></div>
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Recuperation</span>
                            </div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Steady</span>
                        </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-900 rounded-xl text-purple-400 border border-white/5"><Battery size={18} /></div>
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Neuro-Sync</span>
                            </div>
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{journalEntries.length > 2 ? 'Optimal' : 'Calibrated'}</span>
                        </div>
                    </div>
                </div>

                <h3 className="font-black text-slate-600 text-[9px] uppercase tracking-widest mb-8 px-2">Support Handshakes</h3>
                <div className="space-y-4 mb-12">
                    {['Bio-Labs', 'Diagnostic Vault', 'Cloud Registry'].map((item) => (
                        <button onClick={() => showToast(`Syncing with ${item}...`)} key={item} className="group w-full flex items-center justify-between p-6 rounded-[32px] bg-slate-950 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-900 text-left transition-all shadow-xl">
                            <span className="text-[10px] font-black text-slate-500 group-hover:text-indigo-400 uppercase tracking-wider transition-colors">{item}</span>
                            <ChevronRight size={20} className="text-slate-800 group-hover:text-indigo-400 transition-all translate-x-2 group-hover:translate-x-0" />
                        </button>
                    ))}
                </div>

                <div className="p-10 bg-indigo-600/5 rounded-[40px] border border-indigo-500/10 flex flex-col items-center text-center shadow-inner">
                    <Zap className="text-indigo-500 mb-4 animate-pulse" size={32} />
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-2">Cloud Synced</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">1024-Bit Encrypted</p>
                </div>
            </div>
        )
    }

  // --- DEFAULT (DASHBOARD) ---
  return (
    <div className="w-80 bg-slate-900 h-screen border-l border-white/5 p-8 fixed right-0 top-0 overflow-y-auto hidden xl:block z-30 shadow-2xl shadow-indigo-950/20 scrollbar-hide">
      <div className="flex items-center justify-between mb-10">
        <h2 className="font-black text-slate-100 text-xs uppercase tracking-widest">Bio-Telemetry</h2>
        <button onClick={() => showToast("Parsing haptic diagnostics...")} className="text-slate-700 hover:text-indigo-400 transition-colors"><MoreHorizontal size={24} /></button>
      </div>

      <div className="bg-slate-950 rounded-[40px] p-10 mb-12 border border-white/5 shadow-inner">
        <h3 className="text-center text-slate-600 font-black text-[9px] uppercase tracking-widest mb-10">Frequency Sync</h3>
        <div className="flex justify-between items-center px-1">
            {[
                { e: '😫', l: 'Stressed' as const },
                { e: '😢', l: 'Sad' as const },
                { e: '😐', l: 'Neutral' as const },
                { e: '😌', l: 'Calm' as const },
                { e: '😃', l: 'Happy' as const }
            ].map((mood, i) => (
                <button 
                    key={i} 
                    onClick={() => handleMoodLog(mood.l, mood.e)}
                    className="text-3xl hover:scale-[1.6] transition-all duration-500 filter grayscale hover:grayscale-0 opacity-20 hover:opacity-100 active:scale-95 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    title={mood.l}
                >
                    {mood.e}
                </button>
            ))}
        </div>
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center">
             <p className="text-[8px] text-slate-800 font-black uppercase tracking-widest">Biometric Feedback Ready</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-slate-100 text-[10px] uppercase tracking-widest flex items-center gap-3"><BarChart3 size={18} className="text-indigo-500"/> Pulse Matrix</h3>
          <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-indigo-500/20">{journalEntries.length} Records</span>
      </div>

      <div className="h-44 w-full mb-12 bg-slate-950 rounded-[40px] flex items-end justify-between px-10 pb-8 pt-8 border border-white/5 shadow-inner relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none rounded-[40px]"></div>
          {Object.entries(moodChartData).map(([name, count]) => (
            <div key={name} className="flex flex-col items-center gap-4 flex-1 group/bar z-10">
                <div 
                    className="w-3.5 bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover/bar:bg-indigo-400 group-hover/bar:shadow-[0_0_20px_#6366f1]"
                    style={{ height: `${((count as number) / maxCount) * 100}%`, minHeight: (count as number) > 0 ? '8px' : '4px' }}
                ></div>
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest group-hover/bar:text-indigo-400 transition-colors">{name.charAt(0)}</span>
            </div>
          ))}
      </div>

      <h3 className="font-black text-slate-600 text-[9px] uppercase tracking-widest mb-8">Sequence Audit</h3>
      <div className="space-y-6">
        {journalEntries.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-white/5 rounded-[40px] text-center bg-slate-950/50 flex flex-col items-center">
                <Sparkles className="text-slate-800 mb-4" size={48} />
                <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest leading-relaxed">No Biometric Telemetry Captured</p>
            </div>
        ) : (
            journalEntries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="p-7 bg-slate-950 border border-white/5 rounded-[36px] hover:shadow-2xl hover:border-indigo-500/30 transition-all group relative cursor-pointer active:scale-95">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl filter group-hover:scale-125 transition-transform duration-500">{entry.mood === 'Happy' ? '😃' : entry.mood === 'Calm' ? '😌' : entry.mood === 'Neutral' ? '😐' : entry.mood === 'Stressed' ? '😫' : '😢'}</span>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleDateString(undefined, {weekday: 'short'})}</span>
                    </div>
                    <p className="font-black text-slate-200 text-xs truncate group-hover:text-indigo-400 transition-colors tracking-tight leading-none mb-1">{entry.title}</p>
                    <p className="text-[10px] text-slate-600 truncate leading-relaxed font-bold uppercase tracking-widest opacity-60">Handshake Recorded</p>
                </div>
            ))
        )}
      </div>

      {journalEntries.length > 0 && (
          <button onClick={() => showToast("Processing complete bio-history sequence...")} className="w-full py-5 mt-10 text-[9px] font-black text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 rounded-[24px] uppercase tracking-widest hover:bg-indigo-500/10 transition-all active:scale-95 shadow-2xl">Full Sync Audit</button>
      )}
    </div>
  );
};

export default RightSidebar;
