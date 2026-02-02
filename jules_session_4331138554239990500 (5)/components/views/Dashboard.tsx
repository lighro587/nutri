
import React, { useState, useMemo, useEffect } from 'react';
import { Play, Flame, Droplets, Plus, Sparkles, Check, Zap, Activity, Calendar, ArrowRight, Brain, Utensils, ChevronRight, X, BookOpen, Trash2, Smile, Frown, Meh } from 'lucide-react';
import { View, AudioTrack, User, Habit, ScanResult, NutritionGoals, JournalEntry } from '../../types';

interface DashboardProps {
    onNavigate: (view: View) => void;
    onPlay: (track: AudioTrack) => void;
    showToast: (msg: string) => void;
    user: User | null;
    habits: Habit[];
    onToggleHabit: (id: string) => void;
    onAddHabit?: (habit: Habit) => void;
    scanHistory?: ScanResult[];
    nutritionGoals?: NutritionGoals;
    journalEntries?: JournalEntry[];
    onAddJournalEntry?: (entry: JournalEntry) => void;
    onDeleteJournalEntry?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    onNavigate, 
    onPlay, 
    showToast, 
    user, 
    habits, 
    onToggleHabit, 
    onAddHabit,
    scanHistory = [],
    nutritionGoals = { calories: 2000, protein: 150, carbs: 250, fats: 65 },
    journalEntries = [],
    onAddJournalEntry,
    onDeleteJournalEntry
}) => {
  const [dailyQuote, setDailyQuote] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [hydrationLevel, setHydrationLevel] = useState(0); 
  
  // Journal State
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalContent, setNewJournalContent] = useState('');
  const [newJournalMood, setNewJournalMood] = useState<'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Stressed'>('Happy');

  // Time based greeting
  const [greeting, setGreeting] = useState('Hello');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Find Water Habit
  const waterHabit = habits.find(h => h.title.toLowerCase().includes('water'));

  // Calculate Today's Totals
  const todaysTotals = useMemo(() => {
      const today = new Date().toDateString();
      return scanHistory.reduce((acc, scan) => {
          const scanDate = new Date(scan.timestamp).toDateString();
          if (scanDate === today) {
              return {
                  calories: acc.calories + scan.calories,
                  protein: acc.protein + scan.protein,
                  carbs: acc.carbs + scan.carbs,
                  fats: acc.fats + scan.fats
              };
          }
          return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [scanHistory]);

  const getProgress = (current: number, target: number) => Math.min(100, (current / target) * 100);

  // Calculate Wellness Score (0-100)
  const wellnessMetrics = useMemo(() => {
      const calPercentage = (todaysTotals.calories / (nutritionGoals.calories || 1)) * 100;
      let nutritionPoints = 0;
      if (calPercentage > 0) {
          if (calPercentage <= 100) nutritionPoints = 40 * (calPercentage / 100);
          else if (calPercentage <= 115) nutritionPoints = 40;
          else nutritionPoints = Math.max(20, 40 - ((calPercentage - 115) * 0.5));
      }

      const activeHabits = habits.filter(h => h.frequency === 'Daily' || !h.frequency);
      let habitPoints = 0;
      if (activeHabits.length > 0) {
          const completedCount = activeHabits.filter(h => h.completed).length;
          habitPoints = 40 * (completedCount / activeHabits.length);
      }

      const todayStr = new Date().toDateString();
      const hasJournaled = journalEntries.some(entry => new Date(entry.timestamp).toDateString() === todayStr);
      const mindPoints = hasJournaled ? 20 : 0;

      const total = Math.round(nutritionPoints + habitPoints + mindPoints);

      return {
          total: Math.min(100, Math.max(0, total)),
          nutrition: Math.round(nutritionPoints),
          habits: Math.round(habitPoints),
          mind: Math.round(mindPoints)
      };
  }, [todaysTotals, nutritionGoals, habits, journalEntries]);

  const handleGenerateQuote = async () => {
      setLoadingQuote(true);
      
      const localQuotes = [
          "Consistency is the bridge between goals and accomplishment.",
          "Your biology is the most advanced technology you will ever own.",
          "Optimize your inputs, maximize your outputs.",
          "Peak performance is a choice made every single day.",
          "The best way to predict your health is to create it."
      ];

      setTimeout(() => {
          const randomQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
          setDailyQuote(randomQuote);
          setLoadingQuote(false);
      }, 1000);
  };
  
  const handleAddWater = () => {
      if (waterHabit) {
          onToggleHabit(waterHabit.id);
      } else {
          setHydrationLevel(prev => Math.min(prev + 250, 2000));
          showToast("Hydration logged! (+250ml)");
      }
  };

  const handleSaveJournal = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newJournalTitle.trim() || !newJournalContent.trim()) {
          showToast("Please fill in both title and content.");
          return;
      }
      
      if (onAddJournalEntry) {
          onAddJournalEntry({
              id: Date.now().toString(),
              title: newJournalTitle,
              content: newJournalContent,
              mood: newJournalMood,
              timestamp: new Date()
          });
          setNewJournalTitle('');
          setNewJournalContent('');
          setNewJournalMood('Happy');
          setIsJournalOpen(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative animate-fade-in">
      
      {/* Journal Modal */}
      {isJournalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsJournalOpen(false)}></div>
              <div className="relative bg-slate-900 rounded-[40px] w-full max-w-[95%] md:max-w-5xl h-[90vh] md:h-[80vh] shadow-2xl animate-fade-in-up flex overflow-hidden flex-col md:flex-row border border-white/10">
                  <button onClick={() => setIsJournalOpen(false)} className="absolute right-4 top-4 md:right-6 md:top-6 text-slate-500 hover:text-slate-100 z-50 p-2 md:p-3 bg-white/5 rounded-full backdrop-blur-md">
                      <X size={24} />
                  </button>
                  <div className="w-full md:w-1/2 p-6 md:p-12 bg-slate-950 flex flex-col overflow-y-auto">
                      <div className="flex items-center gap-4 mb-10">
                          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><BookOpen size={28} /></div>
                          <div>
                              <h3 className="text-3xl font-black text-slate-100 tracking-tight">Identity Log</h3>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Bio-Reflection Protocol</p>
                          </div>
                      </div>
                      <form onSubmit={handleSaveJournal} className="space-y-8 flex-1 flex flex-col">
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Current Bio-Frequency</label>
                              <div className="grid grid-cols-5 gap-3">
                                  {(['Happy', 'Calm', 'Neutral', 'Stressed', 'Sad'] as const).map(mood => (
                                      <button
                                        key={mood}
                                        type="button"
                                        onClick={() => setNewJournalMood(mood)}
                                        className={`py-4 rounded-2xl text-2xl border-2 transition-all ${newJournalMood === mood ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-xl shadow-indigo-900/40' : 'border-white/5 bg-slate-900 hover:bg-slate-800'}`}
                                      >
                                          {mood === 'Happy' ? '😃' : mood === 'Calm' ? '😌' : mood === 'Neutral' ? '😐' : mood === 'Stressed' ? '😫' : '😢'}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Entry Sequence Title..."
                            value={newJournalTitle}
                            onChange={e => setNewJournalTitle(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-900 border border-white/5 focus:border-indigo-500 outline-none text-xl font-black text-slate-100 placeholder-slate-700 shadow-inner"
                          />
                          <textarea 
                            placeholder="De-serialize your thoughts here..."
                            value={newJournalContent}
                            onChange={e => setNewJournalContent(e.target.value)}
                            className="w-full flex-1 p-6 rounded-2xl bg-slate-900 border border-white/5 focus:border-indigo-500 outline-none text-slate-300 font-medium placeholder-slate-700 shadow-inner resize-none min-h-[200px] leading-relaxed"
                          ></textarea>
                          <button type="submit" className="w-full bg-white text-slate-950 py-5 rounded-[24px] font-black hover:bg-indigo-400 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
                              <Check size={20} strokeWidth={4}/> Commit Record
                          </button>
                      </form>
                  </div>
                  <div className="w-full md:w-1/2 p-6 md:p-12 bg-slate-900 border-t md:border-t-0 md:border-l border-white/5 flex flex-col overflow-hidden">
                      <h3 className="font-black text-slate-100 uppercase text-xs tracking-widest mb-6 md:mb-8 flex items-center gap-3"><Calendar size={20} className="text-slate-500"/> Sequence History</h3>
                      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                          {journalEntries.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                  <BookOpen size={64} className="mb-6"/><p className="font-black uppercase tracking-widest text-xs">Registry Empty</p>
                              </div>
                          ) : (
                              journalEntries.map(entry => (
                                  <div key={entry.id} className="p-6 rounded-[32px] bg-slate-950 border border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer shadow-lg">
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-3">
                                              <span className="text-2xl">{entry.mood === 'Happy' ? '😃' : entry.mood === 'Calm' ? '😌' : entry.mood === 'Neutral' ? '😐' : entry.mood === 'Stressed' ? '😫' : '😢'}</span>
                                              <h4 className="font-black text-slate-100 truncate max-w-[150px]">{entry.title}</h4>
                                          </div>
                                          {onDeleteJournalEntry && <button onClick={() => onDeleteJournalEntry(entry.id)} className="text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>}
                                      </div>
                                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-medium mb-4">{entry.content}</p>
                                      <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleDateString()} • Recorded</div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-[40px] p-8 md:p-12 relative overflow-hidden text-white flex flex-col justify-between min-h-[340px] shadow-2xl border border-white/5">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse-slow"></div>
              <div className="relative z-10">
                  <div className="flex items-center gap-3 text-indigo-400 font-black mb-6 uppercase tracking-widest text-[10px]"><Calendar size={14} /> {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  <h1 className="text-5xl md:text-6xl font-black leading-none mb-4 tracking-tighter">{greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">{user?.name?.split(' ')[0] || 'Friend'}</span>.</h1>
                  <p className="text-slate-400 text-xl font-medium">Your elite biological journey is synchronized.</p>
              </div>
              <div className="relative z-10 mt-10 bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 max-w-2xl hover:bg-white/10 transition-colors shadow-2xl group cursor-default">
                  <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 text-indigo-400"><Sparkles size={18} /><span className="text-[10px] font-black uppercase tracking-widest">System Insight</span></div>
                        <button onClick={handleGenerateQuote} disabled={loadingQuote} className="text-slate-500 hover:text-white transition-all p-2 bg-slate-950 rounded-xl">{loadingQuote ? <Activity className="animate-spin" size={16}/> : <ArrowRight size={16} />}</button>
                  </div>
                  <p className="text-xl md:text-2xl font-light text-slate-100 italic leading-snug drop-shadow-md">"{dailyQuote || "Your biology is the most advanced technology you will ever own."}"</p>
              </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden group hover:border-indigo-500/30 transition-all">
               <div className="flex justify-between items-start z-10 mb-4">
                    <div><h3 className="font-black text-slate-100 text-lg uppercase tracking-tight">Vitality Score</h3><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Real-time Optimization</p></div>
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-950"><Activity size={24} /></div>
               </div>
               <div className="flex flex-col items-center justify-center z-10 flex-1 py-4">
                    <div className="relative flex items-center justify-center mb-8">
                        <svg className="w-44 h-44 transform -rotate-90 filter drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <circle cx="50%" cy="50%" r="76" stroke="#0f172a" strokeWidth="12" fill="none" />
                            <circle cx="50%" cy="50%" r="76" stroke="url(#score-neon)" strokeWidth="12" fill="none" strokeDasharray="477" strokeDashoffset={477 - (477 * wellnessMetrics.total) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            <defs><linearGradient id="score-neon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#d946ef" /></linearGradient></defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 tracking-tighter">{wellnessMetrics.total}</span>
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Units</span>
                        </div>
                    </div>
                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-4 text-xs"><div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10"><Utensils size={14} /></div><div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{width: `${(wellnessMetrics.nutrition / 40) * 100}%`}}></div></div><span className="font-black text-slate-500 w-10 text-right">{wellnessMetrics.nutrition}/40</span></div>
                        <div className="flex items-center gap-4 text-xs"><div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/10"><Flame size={14} /></div><div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-orange-500 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{width: `${(wellnessMetrics.habits / 40) * 100}%`}}></div></div><span className="font-black text-slate-500 w-10 text-right">{wellnessMetrics.habits}/40</span></div>
                        <div className="flex items-center gap-4 text-xs"><div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10"><Brain size={14} /></div><div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-indigo-500 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{width: `${(wellnessMetrics.mind / 20) * 100}%`}}></div></div><span className="font-black text-slate-500 w-10 text-right">{wellnessMetrics.mind}/20</span></div>
                    </div>
               </div>
               <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mb-16"></div>
          </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-slate-900 rounded-[40px] p-10 border border-white/5 shadow-2xl flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                    <div><h3 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-3 uppercase text-sm tracking-widest"><Utensils className="text-orange-500" size={20}/> Intake Command</h3><p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Biological Fuel Monitor</p></div>
                    <button onClick={() => onNavigate('nutrition')} className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-indigo-400 transition-all shadow-2xl uppercase tracking-wider active:scale-95"><Plus size={16} strokeWidth={4}/> Log Intake</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                    <div className="md:col-span-5 flex flex-col items-center">
                        <div className="relative w-48 h-48">
                             <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_20px_rgba(52,211,153,0.1)]"><circle cx="50%" cy="50%" r="76" stroke="#0f172a" strokeWidth="14" fill="none" /><circle cx="50%" cy="50%" r="76" stroke="url(#cal-grad-neon)" strokeWidth="14" fill="none" strokeDasharray="477" strokeDashoffset={477 - (477 * getProgress(todaysTotals.calories, nutritionGoals.calories)) / 100} strokeLinecap="round" className="transition-all duration-1500" /><defs><linearGradient id="cal-grad-neon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs></svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-5xl font-black text-slate-100 tracking-tighter tabular-nums">{todaysTotals.calories}</span><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Kcal Today</span></div>
                        </div>
                    </div>
                    <div className="md:col-span-7 space-y-8 pr-4">
                        <div><div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-widest"><span className="text-slate-500 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div> Protein</span><span className="text-indigo-400">{todaysTotals.protein}g / {nutritionGoals.protein}g</span></div><div className="h-3 bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-1000 shadow-glow" style={{ width: `${getProgress(todaysTotals.protein, nutritionGoals.protein)}%` }}></div></div></div>
                        <div><div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-widest"><span className="text-slate-500 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"></div> Carbs</span><span className="text-amber-400">{todaysTotals.carbs}g / {nutritionGoals.carbs}g</span></div><div className="h-3 bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000 shadow-glow" style={{ width: `${getProgress(todaysTotals.carbs, nutritionGoals.carbs)}%` }}></div></div></div>
                        <div><div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-widest"><span className="text-slate-500 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"></div> Fats</span><span className="text-rose-400">{todaysTotals.fats}g / {nutritionGoals.fats}g</span></div><div className="h-3 bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-rose-500 to-pink-600 rounded-full transition-all duration-1000 shadow-glow" style={{ width: `${getProgress(todaysTotals.fats, nutritionGoals.fats)}%` }}></div></div></div>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-600 to-indigo-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group cursor-pointer flex flex-col justify-between border border-white/10" onClick={handleAddWater}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="relative z-10 flex justify-between items-start"><div><h3 className="text-2xl font-black tracking-tight mb-1">Hydration</h3><p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest">Cellular Saturation</p></div><div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"><Droplets size={24} className="text-white"/></div></div>
                <div className="relative z-10 text-center py-8"><span className="text-8xl font-black tracking-tighter tabular-nums drop-shadow-2xl">{waterHabit ? (waterHabit.completed ? '2.5' : '1.2') : (hydrationLevel/1000).toFixed(1)}</span><span className="text-sm font-black text-cyan-200 block mt-2 uppercase tracking-widest">Liters</span></div>
                <div className="relative z-10"><button className="w-full py-5 bg-white/10 backdrop-blur-xl hover:bg-white/20 rounded-[24px] text-xs font-black transition-all flex items-center justify-center gap-3 border border-white/20 uppercase tracking-wider shadow-xl"><Plus size={18} strokeWidth={4}/> Log 250ML</button></div>
            </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           <div className="bg-slate-900 rounded-[40px] p-8 border border-white/5 shadow-2xl flex flex-col">
                <h3 className="font-black text-slate-100 mb-8 flex items-center gap-3 uppercase text-xs tracking-widest"><Zap size={20} className="text-amber-400 fill-amber-400" /> System Commands</h3>
                <div className="grid grid-cols-2 gap-4 flex-1">
                    {[
                         { label: 'Deep Zen', icon: <Brain size={28}/>, color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20', action: () => onNavigate('mindfulness') },
                         { label: 'Init Habit', icon: <Check size={28}/>, color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20', action: () => onNavigate('habits') },
                         { label: 'Log Pulse', icon: <Calendar size={28}/>, color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20', action: () => setIsJournalOpen(true) },
                         { label: 'Config', icon: <Activity size={28}/>, color: 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800', action: () => onNavigate('settings') },
                    ].map((btn, i) => (
                        <button key={i} onClick={btn.action} className={`${btn.color} rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-xl`}>{btn.icon}<span className="font-black text-[10px] uppercase tracking-widest">{btn.label}</span></button>
                    ))}
                </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-8 border border-white/5 shadow-2xl flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-slate-100 flex items-center gap-3 uppercase text-xs tracking-widest"><Flame size={20} className="text-rose-500 fill-rose-500" /> Consistencies</h3>
                    <button onClick={() => onNavigate('habits')} className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-600 hover:text-indigo-400 hover:bg-slate-800 transition-all shadow-inner border border-white/5"><ChevronRight size={20} /></button>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-2 scrollbar-hide">
                    {habits.slice(0, 3).map(habit => (
                        <div key={habit.id} onClick={() => onToggleHabit(habit.id)} className={`flex items-center gap-4 p-4 rounded-[28px] transition-all cursor-pointer border ${habit.completed ? 'bg-emerald-500/10 border-emerald-500/30 shadow-inner' : 'bg-slate-950 border-white/5 hover:border-indigo-500/30'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shrink-0 ${habit.completed ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-white/10 text-slate-700'}`}><Check size={20} strokeWidth={4} className={habit.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50 transition-all'} /></div>
                            <div className="min-w-0"><h4 className={`font-black text-sm truncate ${habit.completed ? 'text-slate-500 line-through opacity-50' : 'text-slate-200'}`}>{habit.title}</h4><p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mt-0.5">{habit.streak}</p></div>
                        </div>
                    ))}
                    {habits.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-8">
                             <Zap size={32} className="mb-4"/><p className="text-[10px] font-black uppercase tracking-widest">No Sequences Loaded</p>
                        </div>
                    )}
                </div>
           </div>

            <div 
                onClick={() => {
                    showToast("Initializing Deep Zen Sanctuary...");
                    onPlay({
                        title: "Deep Zen Sanctuary",
                        artist: "NutriPulse Biosync",
                        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
                        image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000"
                    });
                }}
                className="bg-slate-950 rounded-[40px] p-10 text-white flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden shadow-2xl border border-white/5 group"
            >
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                        <Brain size={32} className="text-indigo-500 group-hover:animate-pulse"/>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black tracking-tight leading-none">Flow Protocol</h3>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-lg shadow-emerald-950">OPTIMIZED</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium tracking-tight">Neural Ambient • Sync 1.4Hz</p>
                </div>
                
                <div className="relative z-10 flex items-center gap-3 mt-10 text-[10px] font-black uppercase tracking-widest text-indigo-500 group-hover:text-white transition-all">
                    Commence <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>

                <div className="absolute -bottom-8 -right-8 text-white/5 transform rotate-12 group-hover:text-white/10 transition-all duration-700">
                     <Play size={180} fill="currentColor" />
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all"></div>
            </div>
      </div>

    </div>
  );
};

export default Dashboard;
