
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { User } from '../../types';

interface AuthProps {
  onLogin: (user: User, isNew: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Helper to get registered users from local storage
  const getRegisteredUsers = (): Record<string, any> => {
    const data = localStorage.getItem('nutripulse_registry');
    return data ? JSON.parse(data) : {};
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const emailKey = email.toLowerCase().trim();

    // Artificial delay for high-end feel
    setTimeout(() => {
      const registry = getRegisteredUsers();
      const existingUser = registry[emailKey];

      if (isLogin) {
        // SIGN IN LOGIC
        if (!existingUser) {
          setError("No identity found matching this email protocol. Please sign up.");
          setIsLoading(false);
          return;
        }
        
        // In a real app, verify password here. For this elite demo, we verify identity existence.
        onLogin(existingUser, false);
      } else {
        // SIGN UP LOGIC
        if (existingUser) {
          setError("Identity already exists in our registry. Please sign in instead.");
          setIsLoading(false);
          return;
        }
        
        const newUser: User = {
          name: name || email.split('@')[0],
          email: emailKey,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || emailKey}`,
          memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // Persist to registry
        registry[emailKey] = newUser;
        localStorage.setItem('nutripulse_registry', JSON.stringify(registry));
        
        onLogin(newUser, true);
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[650px] border border-slate-800 animate-fade-in">
        
        {/* Branding Side */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-900 to-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-400 to-pink-300 shadow-[0_0_15px_rgba(129,140,248,0.5)]"></div>
            </div>
            <h1 className="text-5xl font-black mb-6 tracking-tighter leading-none">NutriPulse <span className="text-indigo-400">Elite</span></h1>
            <p className="text-indigo-100/80 text-xl leading-relaxed font-medium max-w-xs">
              Advanced Biometrics. Precision Fueling. Optimized Performance.
            </p>
          </div>

          <div className="relative z-10 space-y-4 hidden md:block">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-sm text-white tracking-tight">Local Health Vault</p>
                <p className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.2em]">Prototype Demo Mode</p>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-4">
            Disclaimer: This is a development prototype. Data is stored locally and not encrypted for production.
          </p>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-slate-900 relative">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Identity'}
                </h2>
                <p className="text-slate-400 font-medium">
                {isLogin ? 'Initialize your personal dashboard.' : 'Start your elite wellness journey.'}
                </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold animate-shake">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Marcus Aurelius"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-800 border-2 border-transparent focus:border-indigo-600 focus:bg-slate-800 outline-none transition-all text-white placeholder-slate-600 font-bold shadow-inner"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Protocol</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@nutripulse.io"
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-800 border-2 border-transparent focus:border-indigo-600 focus:bg-slate-800 outline-none transition-all text-white placeholder-slate-600 font-bold shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-800 border-2 border-transparent focus:border-indigo-600 focus:bg-slate-800 outline-none transition-all text-white placeholder-slate-600 font-bold shadow-inner"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white text-slate-900 py-5 rounded-[24px] font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mt-6 shadow-2xl active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin ? 'LOG IN' : 'REGISTER PROTOCOL'} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-400 text-sm font-medium">
                {isLogin ? "New to the system?" : "Identity already verified?"}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                  className="text-indigo-400 font-black ml-2 hover:text-indigo-300 transition-colors uppercase tracking-[0.2em] text-[10px]"
                >
                  {isLogin ? 'DEPLOY NEW ACCOUNT' : 'LOG IN TO VAULT'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
