
import React, { useState } from 'react';
import { User, NutritionGoals } from '../../types';
import { Sparkles, ArrowRight, Check, Target, Beef, Wheat, Droplets, Flame, Loader2, UserCircle } from 'lucide-react';

interface OnboardingProps {
    user: User;
    onFinish: (user: User, goals: NutritionGoals) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onFinish }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState<User['gender']>('Prefer not to say');
    const [goals, setGoals] = useState<NutritionGoals>({
        calories: 2200,
        protein: 160,
        carbs: 240,
        fats: 70
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else finish();
    };

    const finish = () => {
        setIsSaving(true);
        setTimeout(() => {
            onFinish({ ...user, name, bio, gender }, goals);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl border border-indigo-100 overflow-hidden flex flex-col">
                {/* Header / Progress */}
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div className="flex gap-2">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-indigo-600' : 'w-4 bg-slate-200'}`}></div>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {step} of 3</span>
                </div>

                <div className="flex-1 p-10 pt-4 flex flex-col">
                    {step === 1 && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Let's build your profile.</h1>
                                <p className="text-slate-500 text-lg">We'll use this to tailor your nutritional insights.</p>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">How should we call you?</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg font-semibold text-slate-800"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block mb-2">Gender</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {(['Male', 'Female', 'Other', 'Prefer not to say'] as const).map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setGender(g)}
                                                className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${gender === g ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">What's your health bio?</label>
                                    <textarea 
                                        value={bio} 
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="e.g. Trying to gain muscle, training for a marathon, or simply living more mindfully."
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-700 h-24 resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Set your target fuel.</h1>
                                <p className="text-slate-500 text-lg">Adjust your daily calorie and macro goals.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 group transition-all hover:shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm"><Flame size={20}/></div>
                                        <label className="font-bold text-emerald-900">Daily Calories</label>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={goals.calories} 
                                        onChange={e => setGoals({...goals, calories: Number(e.target.value)})}
                                        className="w-full bg-transparent text-4xl font-black text-emerald-600 outline-none"
                                    />
                                    <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest mt-1">kcal</span>
                                </div>

                                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 transition-all hover:shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Beef size={20}/></div>
                                        <label className="font-bold text-indigo-900">Protein Target</label>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={goals.protein} 
                                        onChange={e => setGoals({...goals, protein: Number(e.target.value)})}
                                        className="w-full bg-transparent text-4xl font-black text-indigo-600 outline-none"
                                    />
                                    <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest mt-1">grams</span>
                                </div>

                                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 transition-all hover:shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm"><Wheat size={20}/></div>
                                        <label className="font-bold text-amber-900">Carb Target</label>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={goals.carbs} 
                                        onChange={e => setGoals({...goals, carbs: Number(e.target.value)})}
                                        className="w-full bg-transparent text-4xl font-black text-amber-600 outline-none"
                                    />
                                    <span className="text-amber-400 font-bold uppercase text-[10px] tracking-widest mt-1">grams</span>
                                </div>

                                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 transition-all hover:shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-white rounded-2xl text-rose-600 shadow-sm"><Droplets size={20}/></div>
                                        <label className="font-bold text-rose-900">Fat Target</label>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={goals.fats} 
                                        onChange={e => setGoals({...goals, fats: Number(e.target.value)})}
                                        className="w-full bg-transparent text-4xl font-black text-rose-600 outline-none"
                                    />
                                    <span className="text-rose-400 font-bold uppercase text-[10px] tracking-widest mt-1">grams</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-fade-in text-center flex flex-col items-center justify-center py-10">
                            <div className="w-24 h-24 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-200 animate-bounce-short">
                                <Sparkles size={48} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">You're all set!</h1>
                                <p className="text-slate-500 text-lg max-w-sm">We've personalized your NutriPulse experience based on your profile. Ready to start?</p>
                            </div>
                            
                            <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left space-y-4">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <Check className="text-indigo-600" size={18}/> Personalized Dashboard Ready
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <Check className="text-indigo-600" size={18}/> Nutritional Expert Initialized
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <Check className="text-indigo-600" size={18}/> Daily Goals Locked In
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-10">
                        <button 
                            onClick={handleNext}
                            disabled={isSaving}
                            className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" /> Finalizing...
                                </>
                            ) : (
                                <>
                                    {step === 3 ? "Enter Dashboard" : "Continue"} <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
