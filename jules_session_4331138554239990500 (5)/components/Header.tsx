
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, Check, Trash2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Notification } from '../types';

interface HeaderProps {
    title: string;
    onMenuClick: () => void;
    onSearch?: (query: string) => void;
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onClearAll: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, onSearch, notifications, onMarkRead, onClearAll }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    let placeholder = "Search...";
    if (title === 'Dashboard') placeholder = "Search stats, recipes, or meditations...";
    if (title === 'Nutrition') placeholder = "Search foods (e.g. 'Quinoa Salad')...";
    if (title === 'Mindfulness') placeholder = "Find peace, sleep, focus...";
    if (title === 'Habits') placeholder = "Find routines, goals...";

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(searchTerm);
        }
    };

    const formatTime = (date: Date) => {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

  return (
    <div className="flex items-center justify-between mb-8 gap-4 relative">
      {isSearchOpen && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex items-center p-2 animate-fade-in md:hidden rounded-2xl">
              <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    autoFocus
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (onSearch) onSearch(searchTerm);
                            setIsSearchOpen(false);
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-indigo-500"
                  />
              </div>
              <button onClick={() => setIsSearchOpen(false)} className="p-3 text-slate-400 ml-2"><X size={20} /></button>
          </div>
      )}

      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        aria-label="Open Menu"
        className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Search Bar */}
      <div className="relative w-full max-w-2xl hidden md:block">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900 border border-white/5 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none text-slate-200 placeholder-slate-600 shadow-2xl transition-all font-medium"
        />
      </div>

      {/* Mobile Title */}
      <div className="md:hidden font-black text-slate-100 text-lg flex-1 truncate tracking-tight">
        {title}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-3 rounded-full bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors shadow-sm"
        >
            <Search size={20} />
        </button>
        
        <button 
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className={`relative p-3 rounded-full transition-all shadow-xl ${isNotifOpen ? 'bg-indigo-600 text-white shadow-indigo-900/40' : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-slate-950 font-black">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {isNotifOpen && (
          <div className="absolute top-full right-0 mt-4 w-80 md:w-96 bg-slate-900 rounded-[32px] shadow-2xl border border-white/5 z-[100] animate-fade-in-up overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-100 uppercase text-xs tracking-widest">Alerts</h3>
                {unreadCount > 0 && <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-500/20">{unreadCount} New</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClearAll} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Clear all">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsNotifOpen(false)} className="md:hidden p-2 text-slate-500 hover:text-slate-100 hover:bg-white/5 rounded-xl transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
                    <Bell size={32} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Active Protocol Alerts</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors relative group ${!notif.read ? 'bg-indigo-500/5' : ''}`}
                  >
                    <div className="flex gap-4">
                      <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        notif.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                        notif.type === 'alert' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {notif.type === 'success' ? <CheckCircle2 size={18} /> : 
                         notif.type === 'alert' ? <AlertCircle size={18} /> : <Info size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-black truncate ${!notif.read ? 'text-indigo-400' : 'text-slate-200'}`}>{notif.title}</h4>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{formatTime(notif.timestamp)}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2 font-medium">{notif.message}</p>
                        {!notif.read && (
                          <button 
                            onClick={() => onMarkRead(notif.id)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                          >
                            <Check size={10} strokeWidth={4}/> Dismiss Alert
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-slate-950 border-t border-white/5 text-center">
                <button onClick={() => setIsNotifOpen(false)} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.2em] transition-all">Close Dashboard</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
