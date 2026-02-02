
import React, { useState, useEffect, useRef } from 'react';
import { 
  Pencil, Sparkles, Brain, UtensilsCrossed, LogOut, Camera, Shield, Bell, 
  User as UserIcon, Globe, Zap, Database, Lock, Trash2, Mail, Check, FileText,
  X, Send, MessageCircle, Users, ExternalLink, ChevronRight, Info, Eye, Save
} from 'lucide-react';
import { User } from '../../types';

interface SettingsProps {
    showToast: (msg: string, type?: 'success' | 'error') => void;
    user: User | null;
    onLogout: () => void;
    onUpdateUser: (updatedUser: User) => void;
    onTerminate: () => void;
    onExport: () => void;
}

const Settings: React.FC<SettingsProps> = ({ showToast, user, onLogout, onUpdateUser, onTerminate, onExport }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || 'Mindfulness enthusiast and weekend hiker.');
  const [avatar, setAvatar] = useState(user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest");
  const [timezone, setTimezone] = useState(user?.timezone || 'Pacific Time (UTC-8)');
  
  // AI Preference State
  const [personalizationMode, setPersonalizationMode] = useState<'Balanced' | 'Aggressive' | 'Minimal'>(user?.personalizationMode || 'Balanced');
  const [dietarySuggestions, setDietarySuggestions] = useState(user?.dietarySuggestions ?? true);
  const [notificationEnabled, setNotificationEnabled] = useState(user?.notificationEnabled ?? true);
  const [themeMode, setThemeMode] = useState<'Elite Dark' | 'System Light'>(user?.theme === 'light' ? 'System Light' : 'Elite Dark');

  // Modal States
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (user) {
          setName(user.name);
          setEmail(user.email);
          if (user.bio) setBio(user.bio);
          if (user.avatar) setAvatar(user.avatar);
          if (user.timezone) setTimezone(user.timezone);
          if (user.personalizationMode) setPersonalizationMode(user.personalizationMode);
          if (user.dietarySuggestions !== undefined) setDietarySuggestions(user.dietarySuggestions);
          if (user.notificationEnabled !== undefined) setNotificationEnabled(user.notificationEnabled);
          setThemeMode(user.theme === 'light' ? 'System Light' : 'Elite Dark');
      }
  }, [user]);

  const autoSaveSettings = (updates: Partial<User>) => {
      if (user) {
          const updatedUser = { ...user, ...updates };
          onUpdateUser(updatedUser);
      }
  };

  const handleSaveIdentityManual = () => {
      if (user) {
          const updatedUser: User = {
              ...user,
              name,
              bio,
              avatar: avatar,
              timezone,
              personalizationMode,
              dietarySuggestions,
              notificationEnabled
          };
          onUpdateUser(updatedUser);
          showToast("Profile identity updated successfully.");
      }
  };

  const handlePersonalizationChange = (mode: 'Balanced' | 'Aggressive' | 'Minimal') => {
      setPersonalizationMode(mode);
      autoSaveSettings({ personalizationMode: mode });
  };

  const handleDietaryToggle = () => {
      const newVal = !dietarySuggestions;
      setDietarySuggestions(newVal);
      autoSaveSettings({ dietarySuggestions: newVal });
  };

  const handleNotificationToggle = () => {
      const newVal = !notificationEnabled;
      setNotificationEnabled(newVal);
      autoSaveSettings({ notificationEnabled: newVal });
  };

  const handleThemeChange = (mode: 'Elite Dark' | 'System Light') => {
      setThemeMode(mode);
      const themeVal = mode === 'System Light' ? 'light' : 'dark';
      autoSaveSettings({ theme: themeVal });
      showToast(`Display set to ${mode} protocol.`);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newTimezone = e.target.value;
      setTimezone(newTimezone);
      autoSaveSettings({ timezone: newTimezone });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) {
              showToast("Image size too large (max 5MB)", "error");
              return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setAvatar(base64);
              autoSaveSettings({ avatar: base64 });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleTerminate = () => {
      const confirmed = window.confirm("SECURITY ALERT: This will permanently delete all your health data. Irreversible. Proceed?");
      if (confirmed) {
          onTerminate();
      }
  };

  const sendSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setIsSendingSupport(true);
    setTimeout(() => {
        setIsSendingSupport(false);
        setIsSupportModalOpen(false);
        setSupportMessage('');
        showToast("Support ticket dispatched via encrypted channel.");
    }, 1500);
  };

  return (
    <div className="space-y-12 max-w-5xl animate-fade-in pb-20">
      
      {/* Support Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsSupportModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-fade-in-up border border-slate-100 dark:border-white/10">
                <button onClick={() => setIsSupportModalOpen(false)} className="absolute right-8 top-8 text-slate-500 hover:text-slate-100 p-2 bg-slate-50 dark:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-[24px] flex items-center justify-center text-indigo-400 mb-6 shadow-xl mx-auto border border-indigo-500/20">
                        <MessageCircle size={32} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Direct Support</h3>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Communicate with Elite Engineers</p>
                </div>
                <form onSubmit={sendSupportTicket} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Protocol Anomaly Report</label>
                        <textarea 
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-200 font-medium resize-none leading-relaxed placeholder-slate-400 dark:placeholder-slate-700" 
                            rows={4}
                            placeholder="Describe the discrepancy..."
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSendingSupport}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-5 rounded-[24px] font-black hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase text-xs tracking-[0.3em] disabled:opacity-50"
                    >
                        {isSendingSupport ? <Zap className="animate-spin" size={18} /> : <Send size={18} />} 
                        {isSendingSupport ? "Dispatching..." : "Initialize Ticket"}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Header Section */}
      <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">Identity Control</h2>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em] mt-3">Configure NutriPulse Elite Protocol</p>
      </div>

      {/* Identity Command Center */}
      <section className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden transition-colors duration-500">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
         <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/20"><UserIcon size={20}/></div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase text-xs tracking-widest">Biological Identity</h3>
         </div>

         <div className="flex flex-col xl:flex-row gap-12">
             <div className="flex flex-col items-center gap-6">
                 <div 
                    className="relative w-44 h-44 group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                 >
                     <div className="w-full h-full rounded-[48px] bg-slate-50 dark:bg-slate-950 overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl relative">
                        <img src={avatar} alt="Identity Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                            <Camera className="text-white mb-2" size={32} />
                            <span className="text-[10px] text-white font-black uppercase tracking-widest">Update</span>
                        </div>
                     </div>
                     <button className="absolute -bottom-2 -right-2 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border-4 border-white dark:border-slate-900 hover:bg-indigo-500 transition-all shadow-xl hover:scale-110">
                        <Pencil size={20} />
                     </button>
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                 />
                 <div className="text-center">
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest mb-1">Status: Optimized</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Handshake established {user?.memberSince || '2023'}</p>
                 </div>
             </div>

             <div className="flex-1 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">Identity Name</label>
                         <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold shadow-inner placeholder-slate-400 dark:placeholder-slate-700" 
                         />
                     </div>
                     <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">Primary Email Protocol</label>
                         <input 
                            type="email" 
                            value={email}
                            readOnly
                            className="w-full px-6 py-4 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed shadow-inner" 
                         />
                     </div>
                 </div>
                 
                 <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">Health Biography</label>
                     <textarea 
                        rows={3} 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-300 font-medium resize-none leading-relaxed shadow-inner placeholder-slate-400 dark:placeholder-slate-700"
                    ></textarea>
                 </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">Timezone Logic</label>
                         <div className="relative">
                            <select 
                                value={timezone}
                                onChange={handleTimezoneChange}
                                className="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:border-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold appearance-none cursor-pointer shadow-inner"
                            >
                                <option>Pacific Time (UTC-8)</option>
                                <option>Eastern Time (UTC-5)</option>
                                <option>Greenwich Mean Time (UTC+0)</option>
                                <option>Central European Time (UTC+1)</option>
                                <option>Tokyo (UTC+9)</option>
                            </select>
                            <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 pointer-events-none" size={20}/>
                         </div>
                     </div>
                 </div>

                 <div className="flex justify-end pt-6">
                     <button 
                        onClick={handleSaveIdentityManual}
                        className="bg-slate-900 dark:bg-indigo-600 text-white px-12 py-5 rounded-[24px] font-black hover:bg-indigo-500 transition-all shadow-2xl flex items-center gap-3 uppercase text-xs tracking-[0.3em] active:scale-95"
                    >
                         <Save size={18} className="text-indigo-200 fill-indigo-200"/> Save Profile
                     </button>
                 </div>
             </div>
         </div>
      </section>

      {/* Intelligence & Display Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Intelligence Engine */}
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl flex flex-col justify-between transition-colors duration-500">
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/20"><Brain size={20}/></div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase text-xs tracking-widest">Neural Configuration</h3>
                    </div>

                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Personalization Protocol</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">AI Analytical Depth</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(['Minimal', 'Balanced', 'Aggressive'] as const).map((mode) => (
                                    <button 
                                        key={mode} 
                                        onClick={() => handlePersonalizationChange(mode)}
                                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${personalizationMode === mode ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-600 hover:text-indigo-500'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-7 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-white/5 shadow-inner">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-sm border border-indigo-500/10"><UtensilsCrossed size={20}/></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Smart Logistics</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Autonomous Meal Analysis</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleDietaryToggle}
                                className={`w-16 h-9 rounded-full relative transition-all duration-300 ${dietarySuggestions ? 'bg-indigo-600 shadow-lg shadow-indigo-900/40' : 'bg-slate-300 dark:bg-slate-800'}`}
                            >
                                <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-2xl transition-all ${dietarySuggestions ? 'right-1.5' : 'left-1.5'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
          </section>

          {/* Display & Communications */}
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl flex flex-col justify-between transition-colors duration-500">
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/20"><Eye size={20}/></div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase text-xs tracking-widest">Interface Protocol</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4 mb-10">
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Display Atmosphere</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Current Theme Environment</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {(['Elite Dark', 'System Light'] as const).map((t) => (
                                    <button 
                                        key={t} 
                                        onClick={() => handleThemeChange(t)}
                                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${themeMode === t ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-900/40' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-600 hover:text-blue-500'}`}
                                    >
                                        {t === 'Elite Dark' ? 'Deep Space' : 'White Room'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-7 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-white/5 shadow-inner">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-sm border border-blue-500/10"><Bell size={20}/></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Push Handshakes</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">High-Priority Alerts</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleNotificationToggle}
                                className={`w-16 h-9 rounded-full relative transition-all duration-300 ${notificationEnabled ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'bg-slate-300 dark:bg-slate-800'}`}
                            >
                                <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-2xl transition-all ${notificationEnabled ? 'right-1.5' : 'left-1.5'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
          </section>
      </div>

      {/* Compliance & Security */}
      <section className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl transition-colors duration-500">
            <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10"><Shield size={20}/></div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase text-xs tracking-widest">Security Clearance</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-white/5 flex flex-col items-center text-center transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-500/30 group">
                    <div className="p-5 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-6 shadow-xl border border-indigo-500/10 group-hover:scale-110 transition-transform"><FileText size={32}/></div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2 uppercase text-xs tracking-widest">Data Portability</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-8 px-4">Export entire history to an encrypted PDF container.</p>
                    <button onClick={onExport} className="mt-auto px-10 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-all">GENERATE PDF</button>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-white/5 flex flex-col items-center text-center transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/30 group">
                    <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-6 shadow-xl border border-emerald-500/10 group-hover:scale-110 transition-transform"><Lock size={32}/></div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2 uppercase text-xs tracking-widest">End-to-End Vault</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-8 px-4">Client-side processing enabled. Privacy is absolute.</p>
                    <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-500/5 px-6 py-3 rounded-full uppercase tracking-widest border border-emerald-500/20 shadow-inner">
                        <Check size={14} strokeWidth={4}/> SHIELD ACTIVE
                    </div>
                </div>

                <div className="p-8 bg-rose-500/5 rounded-[40px] border border-rose-500/10 flex flex-col items-center text-center transition-all hover:bg-rose-500/10 hover:border-rose-500/30 group">
                    <div className="p-5 bg-rose-500/10 rounded-2xl text-rose-400 mb-6 shadow-xl border border-rose-500/10 group-hover:scale-110 transition-transform"><Trash2 size={32}/></div>
                    <h4 className="text-lg font-black text-rose-400 mb-2 uppercase text-xs tracking-widest">Identity Purge</h4>
                    <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-widest leading-relaxed mb-8 px-4">Permanently dissolve all registry data. Irreversible.</p>
                    <button onClick={handleTerminate} className="mt-auto px-10 py-3 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-600 transition-all shadow-xl shadow-rose-900/40">TERMINATE</button>
                </div>
            </div>
      </section>
      
      <div className="flex flex-col items-center pt-12 border-t border-slate-100 dark:border-white/5">
          <button 
            onClick={onLogout}
            className="group flex items-center gap-4 px-12 py-6 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-3xl font-black uppercase text-xs tracking-[0.4em] hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent dark:border-white/5 shadow-2xl"
          >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
              Log Out
          </button>
          <div className="mt-10 flex items-center gap-2 text-[10px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-[0.5em] opacity-50">
            <Info size={12} />
            NutriPulse Elite v3.4.0 • Dynamic Core
          </div>
      </div>

    </div>
  );
};

export default Settings;
