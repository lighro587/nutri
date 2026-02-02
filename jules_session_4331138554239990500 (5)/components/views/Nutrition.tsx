
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Camera, Upload, Loader2, Check, Clock, Edit2, X, Target, AlertCircle, Trash2, Sparkles, Flame, Droplets, Wheat, Beef, Plus, ChefHat, Timer, Link as LinkIcon, ExternalLink, Brain, ArrowRight, List, Info, ChevronRight } from 'lucide-react';
import { ScanResult, NutritionGoals, Recipe } from '../../types';
import { searchFood } from '../../data/foodDatabase';

interface NutritionProps {
    showToast: (msg: string) => void;
    scanHistory: ScanResult[];
    onAddScan: (scan: ScanResult) => void;
    onDeleteScan: (id: string) => void;
    goals: NutritionGoals;
    onUpdateGoals: (goals: NutritionGoals) => void;
    externalResult?: ScanResult | null;
    isSearching?: boolean;
    onClearExternalResult?: () => void;
}

const Nutrition: React.FC<NutritionProps> = ({ 
    showToast, 
    scanHistory, 
    onAddScan, 
    onDeleteScan, 
    goals, 
    onUpdateGoals, 
    externalResult, 
    isSearching,
    onClearExternalResult 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const [suggestedMealResult, setSuggestedMealResult] = useState<any>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isEditingResult, setIsEditingResult] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [tempGoals, setTempGoals] = useState<NutritionGoals>(goals);

  useEffect(() => {
      if (externalResult) {
          setScanResult(externalResult);
          setPreviewUrl(externalResult.image || null);
      }
  }, [externalResult]);

  const todaysTotals = useMemo(() => {
      const today = new Date().toDateString();
      return scanHistory.reduce((acc, scan) => {
          const scanDate = new Date(scan.timestamp).toDateString();
          if (scanDate === today) {
              return {
                  calories: acc.calories + (Number(scan.calories) || 0),
                  protein: acc.protein + (Number(scan.protein) || 0),
                  carbs: acc.carbs + (Number(scan.carbs) || 0),
                  fats: acc.fats + (Number(scan.fats) || 0)
              };
          }
          return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [scanHistory]);

  const handleSaveGoals = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateGoals(tempGoals);
      setGoalModalOpen(false);
      showToast("Targets successfully synchronized.");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setScanResult(null);
    setScanError(null);
    setIsScanning(true);
    if(onClearExternalResult) onClearExternalResult();

    // Try to infer food from filename
    const fileName = file.name.split('.')[0].replace(/[-_]/g, ' ');
    const dbResult = searchFood(fileName);

    // Mock image analysis
    setTimeout(() => {
        if (dbResult) {
            const result: ScanResult = {
                ...dbResult,
                id: Date.now().toString(),
                image: objectUrl,
                timestamp: new Date()
            };
            setScanResult(result);
            showToast("PLATE ANALYSIS COMPLETE: High-precision match.");
        } else {
            const mockResult: ScanResult = {
                id: Date.now().toString(),
                foodName: fileName.charAt(0).toUpperCase() + fileName.slice(1),
                calories: 450,
                protein: 30,
                carbs: 50,
                fats: 15,
                insight: "Captured visual data analyzed. (Approximate values - please verify food identity)",
                healthScore: 80,
                image: objectUrl,
                timestamp: new Date()
            };
            setScanResult(mockResult);
            showToast("PLATE ANALYSIS COMPLETE: Identifying components...");
        }
        setIsScanning(false);
    }, 2000);
  };

  const handleLogMeal = () => {
      if(scanResult) {
          onAddScan(scanResult);
          showToast(`DATA LOGGED: ${scanResult.foodName.toUpperCase()}`);
          setPreviewUrl(null);
          setScanResult(null);
          if(onClearExternalResult) onClearExternalResult();
      }
  };

  const handleGetSuggestion = async () => {
      setIsSuggesting(true);
      
      setTimeout(() => {
          const remainingCals = goals.calories - todaysTotals.calories;
          const remainingProtein = goals.protein - todaysTotals.protein;

          let suggestion;
          if (remainingProtein > 20) {
              suggestion = {
                  foodName: "Grilled Chicken & Broccoli",
                  calories: 320,
                  protein: 45,
                  carbs: 12,
                  fats: 8,
                  insight: "Prioritizing protein synthesis to meet your daily intake target."
              };
          } else if (remainingCals > 400) {
              suggestion = {
                  foodName: "Quinoa Energy Bowl",
                  calories: 450,
                  protein: 15,
                  carbs: 65,
                  fats: 12,
                  insight: "High-density carbohydrate configuration to replenish glycogen stores."
              };
          } else {
              suggestion = {
                  foodName: "Light Avocado Salad",
                  calories: 180,
                  protein: 4,
                  carbs: 10,
                  fats: 14,
                  insight: "Light nutritional maintenance to stabilize bio-markers."
              };
          }

          setSuggestedMealResult(suggestion);
          setIsSuggesting(false);
          showToast("ELITE RECOMMENDATION RECEIVED.");
      }, 1500);
  };

  const getProgress = (current: number, target: number) => Math.min(100, (current / target) * 100);

  return (
    <div className="space-y-6 md:space-y-10 relative animate-fade-in pb-20">
      
      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setGoalModalOpen(false)}></div>
          <div className="relative bg-slate-900 rounded-[40px] p-8 md:p-10 max-w-[95%] md:max-w-lg w-full shadow-2xl animate-fade-in-up border border-white/10">
              <button onClick={() => setGoalModalOpen(false)} className="absolute right-6 top-6 md:right-8 md:top-8 text-slate-500 hover:text-slate-100 p-2 bg-white/5 rounded-full transition-colors"><X size={24} /></button>
              <div className="mb-10 text-center">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 mx-auto border border-indigo-500/20 shadow-xl shadow-indigo-950">
                      <Target size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-100 tracking-tight leading-none">Target Re-Calibration</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Adjust your daily intake matrix</p>
              </div>
              <form onSubmit={handleSaveGoals} className="space-y-6">
                  {[
                      { key: 'calories', label: 'Calories (kcal)' },
                      { key: 'protein', label: 'Protein (g)' },
                      { key: 'carbs', label: 'Carbohydrates (g)' },
                      { key: 'fats', label: 'Fats (g)' }
                  ].map(field => (
                      <div key={field.key} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
                          <input 
                            type="number" 
                            value={tempGoals[field.key as keyof NutritionGoals]} 
                            onChange={e => setTempGoals({...tempGoals, [field.key]: Number(e.target.value)})} 
                            className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-white/5 focus:border-indigo-600 outline-none transition-all text-slate-100 font-black shadow-inner" 
                          />
                      </div>
                  ))}
                  <button type="submit" className="w-full bg-white text-slate-950 py-5 rounded-[24px] font-black hover:bg-indigo-400 transition-all shadow-2xl mt-4 uppercase text-xs tracking-widest">COMMIT TARGETS</button>
              </form>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedRecipe(null)}></div>
          <div className="relative bg-slate-900 rounded-[40px] max-w-3xl w-full h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up border border-white/5">
              <button onClick={() => setSelectedRecipe(null)} className="absolute right-8 top-8 z-50 p-3 bg-slate-950 text-slate-400 hover:text-slate-100 transition-all shadow-xl rounded-2xl border border-white/5"><X size={24} /></button>
              
              <div className="h-56 bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-950 p-12 flex items-end relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-40 -mt-40"></div>
                  <div className="relative z-10">
                      <h3 className="text-4xl font-black text-white mb-4 tracking-tighter leading-none">{selectedRecipe.name}</h3>
                      <div className="flex gap-4 text-white font-black text-[10px] uppercase tracking-wider">
                          <span className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10 shadow-xl"><Timer size={16}/> {selectedRecipe.time}</span>
                          <span className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10 shadow-xl"><Flame size={16}/> {selectedRecipe.calories} KCAL</span>
                      </div>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-900 scrollbar-hide">
                  <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <Plus size={18} className="text-indigo-500"/> Raw Components
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedRecipe.ingredients.map((ing, i) => (
                              <li key={i} className="flex items-start gap-4 p-5 bg-slate-950 rounded-[28px] border border-white/5 text-sm text-slate-300 font-medium group hover:border-indigo-500/30 transition-all shadow-inner">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_#6366f1]"></div>
                                  {ing}
                              </li>
                          ))}
                      </ul>
                  </div>

                  {selectedRecipe.instructions && (
                      <div>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                               <List size={18} className="text-indigo-500"/> Synthesis Sequence
                          </h4>
                          <div className="space-y-6 pb-8">
                              {selectedRecipe.instructions.map((step, i) => (
                                  <div key={i} className="flex gap-6 group">
                                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 shadow-lg border border-indigo-500/10 group-hover:scale-110 transition-transform">{i+1}</div>
                                      <p className="text-slate-400 leading-relaxed pt-2 text-sm font-medium">{step}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
        </div>
      )}

      {/* Progress Matrix */}
      <div className="bg-slate-900 rounded-[32px] md:rounded-[48px] p-6 md:p-10 lg:p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-indigo-600/10"></div>
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 md:mb-12 gap-6 relative z-10">
            <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tighter leading-tight md:leading-none">Intake Matrix</h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Live biological fuel telemetery</p>
            </div>
            <button 
                onClick={() => setGoalModalOpen(true)} 
                className="group flex items-center gap-3 px-8 py-4 bg-slate-950 border border-white/5 text-slate-400 rounded-[24px] font-black uppercase text-xs tracking-wider hover:text-white hover:bg-slate-800 transition-all shadow-2xl"
            >
                <Edit2 size={18} className="group-hover:rotate-12 transition-transform text-indigo-500"/> 
                Configure Matrix
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-12 items-center">
            {/* Calories Command Ring */}
            <div className="md:col-span-2 xl:col-span-4 flex flex-col items-center justify-center p-6 md:p-10 bg-slate-950 rounded-[32px] md:rounded-[40px] border border-white/5 shadow-inner group">
                <div className="relative w-40 h-40 md:w-48 md:h-48 mb-6 md:mb-8">
                    <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <circle cx="50%" cy="50%" r="44%" stroke="#0f172a" strokeWidth="14" fill="none" />
                        <circle 
                            cx="50%" cy="50%" r="44%" 
                            stroke="url(#nutri-neon-grad)" 
                            strokeWidth="14" 
                            fill="none" 
                            strokeDasharray="251" 
                            strokeDashoffset={251 - (251 * getProgress(todaysTotals.calories, goals.calories)) / 100} 
                            strokeLinecap="round" 
                            className="transition-all duration-[2000ms] ease-out shadow-glow" 
                        />
                        <defs>
                            <linearGradient id="nutri-neon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-slate-100 tracking-tighter tabular-nums">{todaysTotals.calories}</span>
                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">Calories</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-wider bg-slate-900 px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
                    <Target size={16} className="text-emerald-500"/> Target: {goals.calories}
                </div>
            </div>

            {/* Macro Matrix Grid */}
            <div className="md:col-span-2 xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[
                    { label: 'Protein', current: todaysTotals.protein, target: goals.protein, color: 'from-indigo-500 to-blue-600', text: 'text-indigo-400', icon: <Beef size={24}/>, bg: 'bg-indigo-500/5', progressColor: 'bg-indigo-500', shadow: 'shadow-indigo-900/40' },
                    { label: 'Carbs', current: todaysTotals.carbs, target: goals.carbs, color: 'from-amber-500 to-orange-600', text: 'text-amber-400', icon: <Wheat size={24}/>, bg: 'bg-amber-500/5', progressColor: 'bg-amber-500', shadow: 'shadow-amber-900/40' },
                    { label: 'Fats', current: todaysTotals.fats, target: goals.fats, color: 'from-rose-500 to-pink-600', text: 'text-rose-400', icon: <Droplets size={24}/>, bg: 'bg-rose-500/5', progressColor: 'bg-rose-500', shadow: 'shadow-rose-900/40' }
                ].map((m, i) => (
                    <div key={i} className={`p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-slate-900 shadow-2xl ${m.bg} flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500`}>
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                            <div className={`p-3 md:p-4 bg-slate-950 rounded-2xl shadow-xl ${m.text} border border-white/5`}>{m.icon}</div>
                            <span className={`text-xl md:text-2xl font-black ${m.text} tracking-tighter`}>{Math.round(getProgress(m.current, m.target))}%</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{m.label}</p>
                            <div className="flex items-baseline flex-wrap gap-2">
                                <span className={`text-3xl md:text-4xl font-black ${m.text} tracking-tighter tabular-nums`}>{m.current}g</span>
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">/ {m.target}G</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-950/80 rounded-full h-2.5 mt-8 p-0.5 border border-white/5 overflow-hidden shadow-inner">
                            <div className={`${m.progressColor} h-full rounded-full transition-all duration-1500 shadow-[0_0_12px_rgba(255,255,255,0.1)]`} style={{ width: `${getProgress(m.current, m.target)}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* AI Intelligence Deck */}
      <div className="bg-slate-950 rounded-[32px] md:rounded-[48px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
            
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 md:gap-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-4 mb-4 md:mb-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-950">
                            <Sparkles className="text-indigo-400" size={24} />
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight md:leading-none">Smart Recommendation</h3>
                    </div>
                    <p className="text-slate-400 text-base md:text-xl leading-relaxed font-medium">Deep biological analysis reveals the optimal meal path to complete your daily protocol sequence.</p>
                </div>
                {!suggestedMealResult && (
                    <button 
                        onClick={handleGetSuggestion}
                        disabled={isSuggesting}
                        className="w-full md:w-auto px-8 md:px-12 py-4 md:py-6 bg-white text-slate-950 rounded-[24px] md:rounded-[28px] font-black flex items-center justify-center gap-4 hover:bg-indigo-400 transition-all shadow-2xl disabled:opacity-50 hover:scale-105 active:scale-95 group uppercase tracking-widest text-xs"
                    >
                        {isSuggesting ? <Loader2 className="animate-spin" size={24}/> : <Brain size={24} className="group-hover:text-slate-100 transition-colors"/>} 
                        {isSuggesting ? "Synthesizing..." : "Initialize Recommendation"}
                    </button>
                )}
            </div>

            {suggestedMealResult && (
                <div className="mt-8 md:mt-12 relative z-10 animate-fade-in-up">
                    <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] p-6 md:p-12 border border-white/10 flex flex-col md:flex-row gap-8 md:gap-12 items-center shadow-2xl">
                        <div className="w-full md:w-1/3">
                             <div className="aspect-square bg-slate-950 rounded-[24px] md:rounded-[32px] flex flex-col items-center justify-center text-indigo-400 border border-white/5 shadow-inner p-6 md:p-8 text-center group">
                                 <ChefHat size={60} md:size={80} className="opacity-10 mb-4 md:mb-6 group-hover:scale-110 transition-transform" />
                                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Elite Culinary</p>
                             </div>
                        </div>
                        <div className="flex-1">
                             <div className="flex flex-col sm:flex-row justify-between items-start mb-6 md:mb-8 gap-4 md:gap-6">
                                 <div>
                                     <h4 className="text-2xl md:text-4xl font-black text-slate-100 tracking-tighter leading-tight md:leading-none">{suggestedMealResult.foodName}</h4>
                                     <div className="flex flex-wrap gap-2 md:gap-4 mt-3 md:mt-4">
                                         <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Bio-Optimal</span>
                                         <span className="bg-indigo-500/10 text-indigo-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Synthesis Ready</span>
                                     </div>
                                 </div>
                             </div>
                             <p className="text-slate-400 text-base md:text-xl italic leading-relaxed mb-8 md:mb-10 border-l-4 border-indigo-600 pl-4 md:pl-8 font-medium">"{suggestedMealResult.insight}"</p>
                             
                             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                 {[
                                     { l: 'Calories', v: suggestedMealResult.calories, c: 'text-white' },
                                     { l: 'Protein', v: `${suggestedMealResult.protein}g`, c: 'text-indigo-400' },
                                     { l: 'Carbs', v: `${suggestedMealResult.carbs}g`, c: 'text-amber-400' },
                                     { l: 'Fats', v: `${suggestedMealResult.fats}g`, c: 'text-rose-400' }
                                 ].map((s, i) => (
                                     <div key={i}>
                                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">{s.l}</p>
                                         <p className={`text-xl md:text-2xl font-black tabular-nums ${s.c}`}>{s.v}</p>
                                     </div>
                                 ))}
                             </div>
                        </div>
                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <button 
                                onClick={handleGetSuggestion}
                                className="w-full p-5 bg-white/10 hover:bg-white/20 text-white rounded-[24px] transition-all border border-white/10 shadow-xl"
                                title="Next variant"
                            >
                                <ArrowRight size={28} />
                            </button>
                             <button 
                                onClick={() => setSuggestedMealResult(null)}
                                className="w-full p-5 bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-[24px] transition-all border border-white/10 shadow-xl"
                                title="Close intelligence"
                            >
                                <X size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
      </div>

      {/* Visual Input Deck */}
      <div className="w-full border-4 border-dashed border-slate-900 rounded-[32px] md:rounded-[48px] bg-slate-900/40 p-6 md:p-12 text-center shadow-inner min-h-[350px] md:min-h-[450px] flex items-center justify-center group hover:border-indigo-500/30 transition-all duration-700">
        {!previewUrl && !isSearching ? (
            <div className="max-w-xl animate-fade-in">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-950 text-indigo-500 rounded-[28px] md:rounded-[36px] flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-2xl group-hover:rotate-6 transition-all duration-500 border border-white/5">
                    <Camera size={32} md:size={44} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-4xl font-black mb-4 text-slate-100 tracking-tighter leading-tight md:leading-none">Synchronize Intake</h3>
                <p className="text-slate-500 text-base md:text-xl mb-8 md:mb-12 leading-relaxed font-medium">Analyze plate geometry and distribution for high-precision macro de-serialization.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-950 px-8 md:px-12 py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black hover:bg-indigo-400 transition-all flex items-center justify-center gap-4 shadow-2xl uppercase tracking-widest text-xs">
                        <Upload size={22}/> Local Files
                    </button>
                    <button onClick={() => cameraInputRef.current?.click()} className="bg-slate-950 text-slate-400 border border-white/10 px-8 md:px-12 py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl uppercase tracking-widest text-xs">
                        <Camera size={22}/> Plate Scanner
                    </button>
                </div>
                <p className="mt-8 md:mt-10 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                    <Info size={14} className="text-indigo-500"/> Calibrated for Natural Light
                </p>
            </div>
        ) : (
            <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-16 text-left animate-fade-in-up">
                <div className="w-full xl:w-[45%] flex-shrink-0">
                    <div className="relative rounded-[48px] overflow-hidden shadow-2xl border-[16px] border-slate-900 aspect-square bg-slate-950 group">
                        {previewUrl && <img src={previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-[2000ms]" alt="Visual intake capture" />}
                        {(isScanning || isSearching) && (
                            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-12 text-center z-50">
                                <Loader2 className="animate-spin mb-8 text-indigo-500" size={80} />
                                <h4 className="text-3xl font-black mb-4 tracking-tighter uppercase tracking-wider">Parsing Plate Logic...</h4>
                                <p className="text-slate-600 text-xs font-black uppercase tracking-widest max-w-xs leading-relaxed">
                                    {isSearching ? "Global database handshake in progress" : "Computer vision segmenting nutritional metadata"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {scanResult && !isScanning && !isSearching && (
                    <div className="flex-1 bg-slate-900 p-6 md:p-12 rounded-[32px] md:rounded-[48px] shadow-2xl border border-white/5 flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 md:mb-12 gap-6 md:gap-8">
                                <div className="flex-1">
                                    {isEditingResult ? (
                                        <input
                                            type="text"
                                            value={scanResult.foodName}
                                            onChange={e => setScanResult({...scanResult, foodName: e.target.value})}
                                            className="text-3xl md:text-5xl font-black text-slate-100 bg-transparent border-b border-indigo-500 outline-none w-full"
                                        />
                                    ) : (
                                        <h3 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tighter leading-tight md:leading-none">{scanResult.foodName}</h3>
                                    )}
                                    <p className="text-slate-400 text-base md:text-xl mt-4 md:mt-6 leading-relaxed font-medium">{scanResult.insight}</p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <div className="bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-3 uppercase tracking-wider shadow-2xl shadow-indigo-950 border border-indigo-400/20"><Sparkles size={16}/> PROTOCOL VERIFIED</div>
                                    <button
                                        onClick={() => setIsEditingResult(!isEditingResult)}
                                        className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center justify-end gap-2 transition-colors"
                                    >
                                        <Edit2 size={12}/> {isEditingResult ? "Save Identity" : "Correct Identity"}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-10 md:mb-16">
                                {[
                                    { l: 'Calories', v: scanResult.calories, k: 'calories', c: 'bg-slate-950 text-slate-100 border-white/5' },
                                    { l: 'Protein', v: scanResult.protein, k: 'protein', c: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                                    { l: 'Carbs', v: scanResult.carbs, k: 'carbs', c: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                                    { l: 'Fats', v: scanResult.fats, k: 'fats', c: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
                                ].map((s, i) => (
                                    <div key={i} className={`${s.c} p-4 md:p-8 rounded-[24px] md:rounded-[32px] text-center border shadow-inner transition-all hover:scale-105 group`}>
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-2 md:mb-3 tracking-widest group-hover:opacity-100 transition-opacity">{s.l}</p>
                                        {isEditingResult ? (
                                            <input
                                                type="number"
                                                value={s.v}
                                                onChange={e => setScanResult({...scanResult, [s.k]: Number(e.target.value)})}
                                                className="font-black text-xl md:text-2xl tabular-nums bg-transparent border-b border-indigo-500/50 outline-none w-full text-center"
                                            />
                                        ) : (
                                            <p className="font-black text-2xl md:text-3xl tabular-nums">{s.v}{s.k !== 'calories' ? 'g' : ''}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Recipes */}
                            {scanResult.recipes && scanResult.recipes.length > 0 && (
                                <div className="mb-12">
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-8 flex items-center gap-4">
                                        <ChefHat size={18} className="text-indigo-500"/> Alternate Synthesis Paths
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {scanResult.recipes.map((r, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => setSelectedRecipe(r)}
                                                className="p-8 bg-slate-950 rounded-[32px] border border-white/5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-inner flex flex-col justify-between"
                                            >
                                                <h5 className="text-lg font-black text-slate-200 mb-6 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                                                    {r.name}
                                                    <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-all text-indigo-400 translate-x-2 group-hover:translate-x-0"/>
                                                </h5>
                                                <div className="flex items-center gap-6 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                                    <span className="flex items-center gap-3"><Timer size={16}/> {r.time}</span>
                                                    <span className="flex items-center gap-3"><Flame size={16}/> {r.calories} KCAL</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="flex gap-6 pt-12 border-t border-white/5 mt-12">
                            <button onClick={() => { setPreviewUrl(null); setScanResult(null); if(onClearExternalResult) onClearExternalResult(); }} className="flex-1 py-6 border-2 border-white/5 rounded-[28px] font-black text-slate-600 hover:bg-slate-950 transition-all uppercase text-[10px] tracking-widest">Abort</button>
                            <button onClick={handleLogMeal} className="flex-[2] py-6 bg-white text-slate-950 rounded-[28px] font-black hover:bg-indigo-400 transition-all shadow-2xl flex items-center justify-center gap-4 uppercase text-[10px] tracking-widest">
                                <Check size={24} strokeWidth={4}/> Commit Intake Record
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Hidden Inputs */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
    </div>
  );
};

export default Nutrition;
