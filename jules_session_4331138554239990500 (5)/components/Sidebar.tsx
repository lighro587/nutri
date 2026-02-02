
import React from 'react';
import { LayoutDashboard, Utensils, Flower2, CheckCircle2, Settings, User as UserIcon, X, CalendarCheck } from 'lucide-react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose, user }) => {
  const menuItems: { id: View; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, color: 'text-blue-400' },
    { id: 'nutrition', label: 'Nutrition', icon: <Utensils size={20} />, color: 'text-green-400' },
    { id: 'organization', label: 'Command', icon: <CalendarCheck size={20} />, color: 'text-amber-400' },
    { id: 'mindfulness', label: 'Mindfulness', icon: <Flower2 size={20} />, color: 'text-purple-400' },
    { id: 'habits', label: 'Habits', icon: <CheckCircle2 size={20} />, color: 'text-orange-400' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, color: 'text-slate-400' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-2xl flex flex-col border-r border-white/5 shadow-2xl transition-transform duration-300 ease-in-out transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-200 to-white"></div>
            </div>
            <div>
                <h1 className="font-bold text-slate-100 text-lg leading-tight tracking-tight">NutriPulse</h1>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Elite Edition</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-100">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-3 overflow-y-auto mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onChangeView(item.id); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-bold tracking-tight text-sm ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 transform scale-[1.02]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <span className={`${currentView === item.id ? 'text-white' : item.color} transition-colors`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-slate-950/50">
          <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-white/5 rounded-xl transition-all">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 p-[2px] shadow-lg">
                <div className="w-full h-full rounded-full border-2 border-slate-950 overflow-hidden bg-slate-900">
                     {user?.avatar ? (
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={20} className="text-slate-400 m-auto mt-1" />
                    )}
                </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-100 truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Elite Access</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
