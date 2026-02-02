
import React, { useState, useEffect } from 'react';
import { Check, Flame, Calendar, Plus, Rocket, X, Trash2, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Search, Bell } from 'lucide-react';
import { Habit } from '../../types';

interface HabitsProps {
    showToast: (msg: string) => void;
    habits: Habit[];
    onToggleHabit: (id: string) => void;
    onAddHabit?: (habit: Habit) => void;
    onDeleteHabit: (id: string) => void;
}

const Habits: React.FC<HabitsProps> = ({ showToast, habits, onToggleHabit, onAddHabit, onDeleteHabit }) => {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Health', 'Productivity', 'Mindfulness', 'Learning', 'Social'];
  
  // Interactive Focus Hub State
  const [focusIndex, setFocusIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'Health' | 'Productivity' | 'Mindfulness' | 'Learning' | 'Social'>('Health');
  const [newHabitFrequency, setNewHabitFrequency] = useState('Daily');
  const [newHabitReminder, setNewHabitReminder] = useState('09:00');

  // Filter habits based on active tab
  const filteredHabits = habits.filter(h => activeTab === 'All' || h.tag === activeTab);
  
  // Logic to handle focus hub navigation
  useEffect(() => {
    if (habits.length === 0) {
        setFocusIndex(0);
    } else if (focusIndex >= habits.length) {
        setFocusIndex(Math.max(0, habits.length - 1));
    }
  }, [habits.length, focusIndex]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
        interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateHabit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newHabitTitle.trim()) {
          showToast("Please enter a habit title");
          return;
      }

      if(onAddHabit) {
          const images = {
              'Health': "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400",
              'Productivity': "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=400",
              'Mindfulness': "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400",
              'Learning': "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400",
              'Social': "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400"
          };

          onAddHabit({
              id: Date.now().toString(),
              title: newHabitTitle,
              category: newHabitCategory,
              streak: "0 day streak",
              completed: false,
              tag: newHabitCategory,
              frequency: newHabitFrequency,
              reminderTime: newHabitReminder,
              image: images[newHabitCategory] || images['Health']
          });
          
          setNewHabitTitle('');
          setNewHabitCategory('Health');
          setNewHabitReminder('09:00');
          setIsModalOpen(false);
          showToast(`Habit "${newHabitTitle}" initialized.`);
      }
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDeleteHabit(id);
      showToast("Habit purged from system.");
  }

  const toggleTimer = () => {
      setIsTimerRunning(!isTimerRunning);
  }

  const resetTimer = () => {
      setIsTimerRunning(false);
      setSeconds(0);
  }

  const finishSession = (id: string) => {
      onToggleHabit(id);
      showToast(`Session recorded: ${formatTime(seconds)}`);
      resetTimer();
  }

  const nextFocusHabit = () => {
      resetTimer();
      setFocusIndex((prev) => (prev + 1) % habits.length);
  }

  const prevFocusHabit = () => {
      resetTimer();
      setFocusIndex((prev) => (prev - 1 + habits.length) % habits.length);
  }

  const renderNewHabitModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[40px] p-8 md:p-12 max-w-[95%] md:max-w-lg w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] animate-fade-in-up border border-slate-100 ring-1 ring-black/5">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 md:right-8 md:top-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                  <X size={24} />
              </button>
              
              <div className="mb-10 text-center sm:text-left">
                <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 mx-auto sm:mx-0">
                    <Rocket size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Initialize Habit</h3>
                <p className="text-slate-500 font-medium">Define your new performance routine.</p>
              </div>

              <form onSubmit={handleCreateHabit} className="space-y-6">
                  <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Habit Protocol Name</label>
                      <input 
                        type="text" 
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        placeholder="e.g. Cognitive Deep Work" 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-0 outline-none transition-all placeholder-slate-400 text-slate-900 font-bold"
                        autoFocus
                      />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                        <select 
                            value={newHabitCategory}
                            onChange={(e) => setNewHabitCategory(e.target.value as any)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-bold appearance-none cursor-pointer"
                        >
                            {tabs.filter(t => t !== 'All').map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                        <select 
                            value={newHabitFrequency}
                            onChange={(e) => setNewHabitFrequency(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-bold appearance-none cursor-pointer"
                        >
                            <option value="Daily">Daily Intake</option>
                            <option value="Weekly">Weekly Cycle</option>
                            <option value="Weekdays">Performance Days</option>
                            <option value="Weekends">Recovery Window</option>
                        </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Bell size={12}/> Reminder Schedule
                      </label>
                      <input 
                        type="time" 
                        value={newHabitReminder}
                        onChange={(e) => setNewHabitReminder(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 font-bold cursor-pointer"
                      />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-slate-950 text-white py-5 rounded-[24px] font-black hover:bg-indigo-600 transition-all shadow-2xl hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  >
                      <Plus size={20} /> Deploy Habit
                  </button>
              </form>
          </div>
      </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
        <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center text-indigo-600 border border-indigo-50 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                <Rocket size={56} />
            </div>
        </div>
        
        <div className="max-w-md">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Forge Your Future</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">You haven't initialized any habits yet. Start a new routine to optimize your biological performance.</p>
        </div>

        <button 
            onClick={() => setIsModalOpen(true)}
            className="group bg-slate-950 text-white px-10 py-5 rounded-[24px] font-black flex items-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl hover:scale-105 active:scale-95 uppercase tracking-widest text-sm"
        >
            <Plus size={20} className="group-hover:rotate-90 transition-transform"/> Start Your Journey
        </button>
    </div>
  );

  if (habits.length === 0) {
      return (
          <>
            {renderEmptyState()}
            {isModalOpen && renderNewHabitModal()}
          </>
      )
  }

  const currentFocusHabit = habits[focusIndex];

  return (
    <div className="space-y-10 relative pb-20">
       {isModalOpen && renderNewHabitModal()}

       {/* Interactive Focus Hub */}
       {currentFocusHabit && (
        <div className="w-full bg-slate-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

            <div className="relative z-10 flex flex-col xl:flex-row gap-12 items-center">
                <div className="w-full xl:w-1/3 flex flex-col items-center justify-center">
                    <div className="relative w-64 h-64">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                            {isTimerRunning && (
                                <circle 
                                    cx="50%" cy="50%" r="90" 
                                    stroke="url(#focus-gradient)" 
                                    strokeWidth="12" fill="none" 
                                    strokeDasharray="565" 
                                    strokeDashoffset={565 - (seconds % 60) * (565 / 60)} 
                                    strokeLinecap="round" 
                                    className="transition-all duration-1000 shadow-glow"
                                />
                            )}
                            <defs>
                                <linearGradient id="focus-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-black font-mono tracking-tighter text-white tabular-nums">{formatTime(seconds)}</span>
                            <span className="text-[10px] text-indigo-400 mt-2 uppercase font-black tracking-[0.3em]">{isTimerRunning ? 'Pulse Active' : 'Calibrating'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-center xl:text-left">
                    <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">Focus Core</span>
                        <div className="flex gap-2">
                             <button onClick={prevFocusHabit} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"><ChevronLeft size={18} /></button>
                             <button onClick={nextFocusHabit} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-none">{currentFocusHabit.title}</h2>
                    <p className="text-slate-400 text-base md:text-lg mb-10 font-medium">
                        {currentFocusHabit.streak} consistency score • {currentFocusHabit.frequency || 'Daily Protocol'}
                        {currentFocusHabit.reminderTime && ` • Reminder: ${currentFocusHabit.reminderTime}`}
                    </p>

                    <div className="flex flex-wrap justify-center xl:justify-start gap-4">
                        {!isTimerRunning ? (
                            <button 
                                onClick={toggleTimer}
                                className="px-10 py-5 bg-white text-slate-900 rounded-[24px] font-black flex items-center gap-3 hover:bg-indigo-50 transition-all shadow-2xl uppercase tracking-widest text-xs"
                            >
                                <Play size={20} fill="currentColor" /> Start Session
                            </button>
                        ) : (
                            <button 
                                onClick={toggleTimer}
                                className="px-10 py-5 bg-amber-500 text-white rounded-[24px] font-black flex items-center gap-3 hover:bg-amber-400 transition-all shadow-2xl uppercase tracking-widest text-xs"
                            >
                                <Pause size={20} fill="currentColor" /> Halt Session
                            </button>
                        )}
                        
                        {seconds > 0 && (
                            <button 
                                onClick={() => finishSession(currentFocusHabit.id)}
                                className="px-10 py-5 bg-emerald-600 text-white rounded-[24px] font-black flex items-center gap-3 hover:bg-emerald-500 transition-all shadow-2xl uppercase tracking-widest text-xs"
                            >
                                <Check size={20} strokeWidth={4}/> Commit
                            </button>
                        )}

                        <button 
                            onClick={resetTimer}
                            className="p-5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-[24px] transition-all border border-white/10"
                            title="Reset Calibration"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
       )}

       {/* Filter Engine */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                            activeTab === tab 
                            ? 'bg-slate-950 border-slate-950 text-white shadow-xl scale-105' 
                            : 'bg-white border-white text-slate-400 hover:text-slate-900 hover:border-slate-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="Locate habit..." className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-white focus:border-indigo-100 outline-none transition-all text-xs font-bold text-slate-900 shadow-sm" />
                </div>
                <button onClick={() => setIsModalOpen(true)} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"><Plus size={20} /></button>
            </div>
       </div>

      {/* Habit Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredHabits.map((item) => (
             <div 
                key={item.id} 
                onClick={() => onToggleHabit(item.id)}
                className={`bg-white rounded-[40px] p-6 border transition-all duration-500 group cursor-pointer flex flex-col h-full relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 ${item.completed ? 'border-emerald-200 ring-4 ring-emerald-50' : 'border-white'}`}
            >
                {/* Completed Overlay */}
                {item.completed && (
                    <div className="absolute inset-0 bg-emerald-50/40 backdrop-blur-[2px] z-10 flex items-center justify-center animate-fade-in">
                         <div className="bg-white p-5 rounded-[32px] shadow-2xl text-emerald-500 animate-bounce-short border-4 border-emerald-100">
                             <Check size={48} strokeWidth={4} />
                         </div>
                    </div>
                )}
                
                <div className="relative h-44 rounded-[32px] overflow-hidden mb-6 bg-slate-50">
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                     
                     <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black text-white z-20 border border-white/20 shadow-lg">
                            <Flame size={12} className="text-orange-400 fill-orange-400" /> {item.streak}
                        </div>
                        {item.reminderTime && (
                            <div className="bg-indigo-500/40 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black text-white z-20 border border-white/20 shadow-lg">
                                <Bell size={12}/> {item.reminderTime}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={(e) => handleDelete(e, item.id)}
                        className="absolute top-4 right-4 p-3 bg-white/90 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-xl z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="font-black text-slate-950 text-xl tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] 
                            ${item.tag === 'Health' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            item.tag === 'Learning' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                            item.tag === 'Mindfulness' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                            item.tag === 'Productivity' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
                            'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {item.tag}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{item.frequency || 'Daily Intake'}</p>
                </div>
                
                <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase text-slate-300 tracking-widest">
                    <span>Performance Tracking Active</span>
                    <ChevronRight size={14}/>
                </div>
             </div>
        ))}
         
         {/* Adaptive Initializer Card */}
         <div 
            onClick={() => setIsModalOpen(true)}
            className="border-4 border-dashed border-indigo-100 rounded-[40px] p-8 flex flex-col items-center justify-center gap-6 text-indigo-300 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white transition-all cursor-pointer min-h-[350px] bg-slate-50/50 group"
         >
             <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                 <Plus size={40} strokeWidth={3} />
             </div>
             <p className="font-black uppercase tracking-[0.3em] text-xs">Append New Protocol</p>
         </div>
      </div>
    </div>
  );
};

export default Habits;
