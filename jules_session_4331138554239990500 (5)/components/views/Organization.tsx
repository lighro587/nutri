
import React, { useState, useMemo } from 'react';
import { 
    Calendar as CalendarIcon, CheckCircle2, FileText, Plus, Search, Trash2, Pin, 
    ChevronLeft, ChevronRight, Bell, AlertTriangle, Clock, MoreHorizontal,
    X, Check, LayoutGrid, ListTodo, Info, Edit3
} from 'lucide-react';
import { Reminder, Note } from '../../types';

interface OrganizationProps {
    reminders: Reminder[];
    setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}

const Organization: React.FC<OrganizationProps> = ({ reminders, setReminders, notes, setNotes, showToast }) => {
    const [activeTab, setActiveTab] = useState<'calendar' | 'reminders' | 'notes'>('reminders');
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    // New Reminder State
    const [remTitle, setRemTitle] = useState('');
    const [remDate, setRemDate] = useState('');
    const [remPriority, setRemPriority] = useState<Reminder['priority']>('Medium');

    // Note Editing State
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');

    // Calendar State
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const addReminder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!remTitle.trim() || !remDate) return;
        const newRem: Reminder = {
            id: Date.now().toString(),
            title: remTitle,
            dueDate: new Date(remDate).toISOString(),
            priority: remPriority,
            completed: false,
            notified: false
        };
        setReminders([newRem, ...reminders]);
        setIsReminderModalOpen(false);
        setRemTitle(''); setRemDate('');
        showToast("Protocol reminder scheduled.");
    };

    const handleOpenNoteModal = (note?: Note) => {
        if (note) {
            setEditingNoteId(note.id);
            setNoteTitle(note.title);
            setNoteContent(note.content);
        } else {
            setEditingNoteId(null);
            setNoteTitle('');
            setNoteContent('');
        }
        setIsNoteModalOpen(true);
    };

    const saveNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteTitle.trim()) return;

        if (editingNoteId) {
            // Update existing
            setNotes(prev => prev.map(n => n.id === editingNoteId ? {
                ...n,
                title: noteTitle,
                content: noteContent,
                lastModified: new Date().toISOString()
            } : n));
            showToast("Intelligence note updated.");
        } else {
            // Create new
            const newNote: Note = {
                id: Date.now().toString(),
                title: noteTitle,
                content: noteContent,
                lastModified: new Date().toISOString(),
                pinned: false
            };
            setNotes([newNote, ...notes]);
            showToast("Intelligence note synchronized.");
        }

        setIsNoteModalOpen(false);
        setEditingNoteId(null);
        setNoteTitle('');
        setNoteContent('');
    };

    const toggleReminder = (id: string) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    };

    const deleteReminder = (id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id));
        showToast("Reminder purged.");
    };

    const toggleNotePin = (id: string) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    };

    const deleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        showToast("Note deleted.");
    };

    // --- CALENDAR LOGIC ---
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const calendarData = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        const cells = [];
        // Previous month filler
        for (let i = firstDay - 1; i >= 0; i--) {
            cells.push({ day: prevMonthLastDay - i, month: month - 1, year, currentMonth: false });
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            cells.push({ day: i, month: month, year, currentMonth: true });
        }
        // Next month filler
        const remaining = 42 - cells.length;
        for (let i = 1; i <= remaining; i++) {
            cells.push({ day: i, month: month + 1, year, currentMonth: false });
        }
        return cells;
    }, [viewDate]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const remindersOnSelectedDay = useMemo(() => {
        if (!selectedDate) return [];
        return reminders.filter(r => {
            const d = new Date(r.dueDate);
            return d.getDate() === selectedDate.getDate() &&
                   d.getMonth() === selectedDate.getMonth() &&
                   d.getFullYear() === selectedDate.getFullYear();
        }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [selectedDate, reminders]);

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-inner">
                    {(['reminders', 'notes', 'calendar'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => activeTab === 'notes' ? handleOpenNoteModal() : setIsReminderModalOpen(true)}
                        className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all shadow-2xl flex items-center gap-3"
                    >
                        <Plus size={18} strokeWidth={3}/> New Entry
                    </button>
                </div>
            </div>

            {/* View Containers */}
            {activeTab === 'reminders' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg uppercase tracking-tight">Tactical Schedule</h3>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest">{reminders.filter(r => !r.completed).length} Active</span>
                        </div>
                        
                        {reminders.length === 0 ? (
                            <div className="py-20 text-center border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[40px] opacity-40">
                                <ListTodo size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="font-black uppercase tracking-[0.4em] text-xs">Registry Clear</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reminders.map(rem => (
                                    <div key={rem.id} className={`group flex items-center gap-6 p-6 rounded-[32px] border transition-all hover:shadow-2xl ${rem.completed ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-white/5 opacity-50' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-indigo-500/30'}`}>
                                        <button 
                                            onClick={() => toggleReminder(rem.id)}
                                            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${rem.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-white/10 group-hover:border-indigo-500 group-hover:bg-indigo-500/5'}`}
                                        >
                                            {rem.completed && <Check size={24} strokeWidth={4}/>}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-lg font-black tracking-tight mb-1 truncate ${rem.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>{rem.title}</h4>
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date(rem.dueDate).toLocaleString()}</span>
                                                <span className={`px-3 py-1 rounded-lg ${rem.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : rem.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>{rem.priority} Priority</span>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteReminder(rem.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-10 order-1 lg:order-2">
                        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-8 flex items-center gap-2"><Bell size={16}/> System Pulse</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">Protocols are monitored by the Elite Neural Engine. Real-time visual and haptic alerts will engage upon expiration.</p>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 shadow-inner text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Next Calibration</p>
                                <p className="text-2xl font-black text-white">{reminders.filter(r => !r.completed).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.title || 'None'}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-white/5 shadow-xl">
                            <h3 className="font-black text-slate-900 dark:text-slate-100 text-[10px] uppercase tracking-[0.3em] mb-8">Priority Matrix</h3>
                            <div className="space-y-6">
                                {(['High', 'Medium', 'Low'] as const).map(p => (
                                    <div key={p} className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{p} Protocol</span>
                                        <div className="flex-1 mx-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${p === 'High' ? 'bg-rose-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{width: `${(reminders.filter(r => r.priority === p).length / (reminders.length || 1)) * 100}%`}}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-900 dark:text-slate-100">{reminders.filter(r => r.priority === p).length}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {notes.map(note => (
                            <div key={note.id} className="group relative bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <button onClick={() => toggleNotePin(note.id)} className={`p-2.5 rounded-xl transition-all ${note.pinned ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700 hover:text-indigo-500'}`}>
                                        <Pin size={18} className={note.pinned ? 'fill-white' : ''}/>
                                    </button>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => deleteNote(note.id)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">{note.title}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium flex-1 line-clamp-4">{note.content}</p>
                                <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Sync: {new Date(note.lastModified).toLocaleDateString()}</span>
                                    <button 
                                        onClick={() => handleOpenNoteModal(note)}
                                        className="text-indigo-500 hover:text-indigo-400 flex items-center gap-1.5 group/btn"
                                    >
                                        Edit <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => handleOpenNoteModal()} className="border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center gap-6 text-slate-300 hover:text-indigo-500 hover:border-indigo-500/30 transition-all min-h-[300px] group">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-xl"><Plus size={32}/></div>
                            <p className="font-black uppercase tracking-[0.4em] text-xs">Synchronize Intelligence</p>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-[48px] p-6 md:p-12 border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-none">
                                    {viewDate.toLocaleString('default', { month: 'long' })}
                                </h3>
                                <p className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.4em] mt-3">{viewDate.getFullYear()} LOGISTICS MATRIX</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => changeMonth(-1)} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-inner border border-slate-100 dark:border-white/5"><ChevronLeft size={24}/></button>
                                <button onClick={() => changeMonth(1)} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-inner border border-slate-100 dark:border-white/5"><ChevronRight size={24}/></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 md:gap-4 relative z-10 min-w-[300px]">
                            {daysOfWeek.map(d => (
                                <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">{d}</div>
                            ))}
                            {calendarData.map((cell, i) => {
                                const isCurrent = cell.day === new Date().getDate() && cell.month === new Date().getMonth() && cell.year === new Date().getFullYear();
                                const isSelected = selectedDate && cell.day === selectedDate.getDate() && cell.month === selectedDate.getMonth() && cell.year === selectedDate.getFullYear();
                                const hasReminder = reminders.some(r => {
                                    const d = new Date(r.dueDate);
                                    return d.getDate() === cell.day && d.getMonth() === cell.month && d.getFullYear() === cell.year;
                                });

                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => setSelectedDate(new Date(cell.year, cell.month, cell.day))}
                                        className={`aspect-square rounded-[24px] md:rounded-[32px] p-3 md:p-6 flex flex-col justify-between transition-all group cursor-pointer 
                                            ${cell.currentMonth ? 'bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl' : 'opacity-10 pointer-events-none'} 
                                            ${isSelected ? 'bg-indigo-600 dark:bg-indigo-600 ring-4 ring-indigo-500/20' : ''}`}
                                    >
                                        <span className={`text-lg md:text-xl font-black ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{cell.day}</span>
                                        <div className="flex gap-1">
                                            {hasReminder && (
                                                <div className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full ${isSelected ? 'bg-white shadow-[0_0_10px_white]' : 'bg-indigo-500 shadow-[0_0_10px_#6366f1]'}`}></div>
                                            )}
                                            {isCurrent && !isSelected && (
                                                <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-rose-500"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="xl:col-span-4 flex flex-col gap-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-white/5 shadow-2xl flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Events: {selectedDate?.toLocaleDateString([], { day: 'numeric', month: 'short' })}</h4>
                                <button onClick={() => setIsReminderModalOpen(true)} className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"><Plus size={16}/></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                                {remindersOnSelectedDay.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                        <Clock size={40} className="mb-4 text-slate-300" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em]">No Protocol Scheduled</p>
                                    </div>
                                ) : (
                                    remindersOnSelectedDay.map(rem => (
                                        <div key={rem.id} className={`p-5 rounded-[24px] border ${rem.completed ? 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-white/5 opacity-50' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-indigo-500/20'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${rem.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>{rem.priority}</span>
                                                <span className="text-[10px] font-black text-indigo-500">{formatTime(rem.dueDate)}</span>
                                            </div>
                                            <h5 className={`text-sm font-black truncate ${rem.completed ? 'line-through' : 'text-slate-900 dark:text-slate-100'}`}>{rem.title}</h5>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[40px] p-8 text-white border border-white/5 shadow-2xl relative overflow-hidden">
                             <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                             <div className="flex items-center gap-3 mb-6">
                                <Info size={16} className="text-indigo-400"/>
                                <h4 className="text-[9px] font-black uppercase tracking-[0.4em]">Elite Insights</h4>
                             </div>
                             <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Click any date to visualize your tactical timeline. Use the navigation arrows to shift between monthly logistics cycles.
                             </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isReminderModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsReminderModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 max-w-[95%] md:max-w-lg w-full shadow-2xl animate-fade-in-up border border-slate-100 dark:border-white/10">
                        <button onClick={() => setIsReminderModalOpen(false)} className="absolute right-6 top-6 md:right-8 md:top-8 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100 p-2 bg-slate-50 dark:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
                        <div className="mb-10 text-center">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 mx-auto border border-indigo-500/20 shadow-xl shadow-indigo-950">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">Init Reminder</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Append tactical time entry</p>
                        </div>
                        <form onSubmit={addReminder} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Event Target</label>
                                <input type="text" value={remTitle} onChange={e => setRemTitle(e.target.value)} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-black" placeholder="e.g. Bio-Sync Dose 1"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Time Precision</label>
                                <input type="datetime-local" value={remDate} onChange={e => setRemDate(e.target.value)} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-black cursor-pointer"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Protocol Priority</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['Low', 'Medium', 'High'] as const).map(p => (
                                        <button key={p} type="button" onClick={() => setRemPriority(p)} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${remPriority === p ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-white/5 text-slate-400'}`}>{p}</button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-5 rounded-[24px] font-black hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all shadow-2xl mt-4 uppercase text-xs tracking-[0.3em]">DEPLOY REMINDER</button>
                        </form>
                    </div>
                </div>
            )}

            {isNoteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => { setIsNoteModalOpen(false); setEditingNoteId(null); }}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 max-w-[95%] md:max-w-2xl w-full shadow-2xl animate-fade-in-up border border-slate-100 dark:border-white/10">
                        <button onClick={() => { setIsNoteModalOpen(false); setEditingNoteId(null); }} className="absolute right-6 top-6 md:right-8 md:top-8 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100 p-2 bg-slate-50 dark:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
                        <div className="mb-10">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-3xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20 shadow-xl shadow-blue-950">
                                {editingNoteId ? <Edit3 size={32} /> : <FileText size={32} />}
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">{editingNoteId ? 'Update Intelligence' : 'Sync Intelligence'}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{editingNoteId ? 'Modify biological insights' : 'Log biological insights'}</p>
                        </div>
                        <form onSubmit={saveNote} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Observation Title</label>
                                <input type="text" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} required className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-black" placeholder="e.g. Post-Meal Focus Surge"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deep Log Content</label>
                                <textarea rows={5} value={noteContent} onChange={e => setNoteContent(e.target.value)} required className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/6 focus:border-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-200 font-medium resize-none leading-relaxed" placeholder="Record telemetry here..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-5 rounded-[24px] font-black hover:bg-blue-600 dark:hover:bg-blue-400 transition-all shadow-2xl mt-4 uppercase text-xs tracking-[0.3em]">{editingNoteId ? 'SAVE CHANGES' : 'COMMIT NOTE'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Organization;
