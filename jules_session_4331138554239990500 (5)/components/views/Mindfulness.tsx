
import React, { useState, useEffect, useRef } from 'react';
import { Play, Loader2, Volume2, Square, Headphones, ChevronRight, Mic2, Music, Sliders } from 'lucide-react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
}

type VoiceName = 'Lyra' | 'Kore' | 'Phoebe' | 'Atlas' | 'Aurelius';

const VOICES: { id: VoiceName; apiId: string; label: string; gender: 'Male' | 'Female'; desc: string }[] = [
    { id: 'Aurelius', apiId: 'Fenrir', label: 'Aurelius', gender: 'Male', desc: 'Wise, Deep, Calm' },
    { id: 'Atlas', apiId: 'Charon', label: 'Atlas', gender: 'Male', desc: 'Steady, Warm, Real' },
    { id: 'Lyra', apiId: 'Zephyr', label: 'Lyra', gender: 'Female', desc: 'Soft, Ethereal, Kind' },
    { id: 'Kore', apiId: 'Kore', label: 'Kore', gender: 'Female', desc: 'Clear, Mindful, Steady' },
    { id: 'Phoebe', apiId: 'Puck', label: 'Phoebe', gender: 'Female', desc: 'Gentle, Radiant, Light' }
];

const Mindfulness: React.FC = () => {
  const [sessionType, setSessionType] = useState<'Eating' | 'Focus' | 'Stress' | 'Sleep' | 'Motivation'>('Focus');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Aurelius');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [transcriptDisplay, setTranscriptDisplay] = useState('');
  const [ambientVolume, setAmbientVolume] = useState(0.12);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const ambientNodesRef = useRef<{ oscillators: OscillatorNode[], master: GainNode, filter: BiquadFilterNode } | null>(null);

  // Synthesizes a deep, warm harmonic drone using the browser's audio engine
  const synthesizeAtmosphere = (ctx: AudioContext) => {
    const master = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.Q.value = 1;

    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(ambientVolume, ctx.currentTime + 3);
    
    const oscillators: OscillatorNode[] = [];
    const roots = [55, 82.41, 110]; // A1, E2, A2 - Deep harmonic base
    
    roots.forEach(freq => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.type = 'sine';
        g.gain.value = 0.05;
        osc.connect(g);
        g.connect(filter);
        osc.start();
        oscillators.push(osc);
    });

    filter.connect(master);
    master.connect(ctx.destination);
    return { oscillators, master, filter };
  };

  const startMeditation = async () => {
    setIsGenerating(true);
    setIsSessionActive(true);
    setTranscriptDisplay('');

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      // Start the "Always-On" Ambient Synthesizer
      ambientNodesRef.current = synthesizeAtmosphere(ctx);

      // Mock script generation
      setTimeout(async () => {
          const scripts = {
              Focus: ["Center your mind on the present moment.", "Breathe in clarity, breathe out distraction.", "Your attention is your most valuable asset.", "Stay grounded in the here and now."],
              Stress: ["Release the tension in your shoulders.", "Let every breath wash away a layer of worry.", "You are safe, you are calm, you are in control.", "Find the silence between your thoughts."],
              Sleep: ["Feel the weight of your body against the bed.", "The day is done, and it is time to rest.", "Let your mind drift into the quiet dark.", "Surrender to the rhythm of your breath."],
              Eating: ["Appreciate the colors and textures before you.", "Savor each bite with full awareness.", "Nourish your body with gratitude.", "Listen to the signals of your satiety."],
              Motivation: ["Ignite the fire within your core.", "You are capable of extraordinary things.", "Every step forward is a victory.", "Pulse with the energy of your purpose."]
          };
          
          const sentences = scripts[sessionType] || scripts.Focus;
          setIsGenerating(false);

          for (let i = 0; i < sentences.length; i++) {
              await new Promise(resolve => setTimeout(resolve, 4000));
              if (!isSessionActive) break;
              setTranscriptDisplay(sentences[i]);
              if (i === sentences.length - 1) {
                  setTimeout(() => stopMeditation(), 6000);
              }
          }
      }, 1500);

    } catch (e) {
      console.error(e);
      stopMeditation();
      setIsGenerating(false);
    }
  };

  const stopMeditation = () => {
    audioQueueRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    audioQueueRef.current = [];
    
    if (ambientNodesRef.current) {
        const { oscillators, master } = ambientNodesRef.current;
        master.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + 2);
        setTimeout(() => {
            oscillators.forEach(o => { try { o.stop(); } catch(e){} });
            master.disconnect();
        }, 2100);
        ambientNodesRef.current = null;
    }
    
    setIsSessionActive(false);
    setTranscriptDisplay('');
  };

  // Background Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: Particle[] = [];
    let animationId: number;
    let time = 0;

    const init = () => {
      canvas.width = containerRef.current?.offsetWidth || 800;
      canvas.height = containerRef.current?.offsetHeight || 600;
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 1.5,
        color: Math.random() > 0.5 ? '#818cf8' : '#c084fc',
        opacity: Math.random() * 0.3
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;
      
      const pulse = Math.sin(time * 0.4) * 0.1 + 0.15;
      const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
      grad.addColorStop(0, `rgba(99, 102, 241, ${pulse})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill();
      });
      animationId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', init);
    init(); draw();
    return () => { window.removeEventListener('resize', init); cancelAnimationFrame(animationId); };
  }, []);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {!isSessionActive ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-xl">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Atmosphere Target</h3>
                <div className="space-y-3">
                    {(['Motivation', 'Eating', 'Focus', 'Stress', 'Sleep'] as const).map(type => (
                        <button key={type} onClick={() => setSessionType(type)} className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${sessionType === type ? 'bg-slate-900 border-slate-900 text-white translate-x-2' : 'bg-slate-50 border-white text-slate-400 hover:bg-white hover:border-indigo-100'}`}>
                            <span className="font-black text-[10px] uppercase tracking-widest">{type}</span>
                            <ChevronRight size={16} className={sessionType === type ? 'text-indigo-400' : 'opacity-20'}/>
                        </button>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-7 bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Vocal Pairing</h3>
                   <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
                       <Sliders size={14} className="text-slate-400"/>
                       <input type="range" min="0" max="0.3" step="0.01" value={ambientVolume} onChange={(e) => setAmbientVolume(parseFloat(e.target.value))} className="w-16 accent-indigo-600"/>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {VOICES.map(v => (
                        <button key={v.id} onClick={() => setSelectedVoice(v.id)} className={`p-5 rounded-3xl border-2 transition-all text-left ${selectedVoice === v.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-white hover:bg-white'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedVoice === v.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300 shadow-sm'}`}><Mic2 size={16}/></div>
                                <p className="font-black text-[10px] uppercase tracking-widest text-slate-900">{v.label}</p>
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{v.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      ) : null}

      <div className="bg-slate-950 rounded-[40px] relative overflow-hidden shadow-2xl min-h-[600px] flex flex-col border border-white/5" ref={containerRef}>
        <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />
        
        <div className="relative z-20 flex flex-col items-center justify-center flex-1 p-10 text-center">
          {!isSessionActive ? (
            <div className="animate-fade-in flex flex-col items-center max-w-2xl">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mb-10 animate-pulse shadow-[0_0_25px_#6366f1]"></div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Seek Stillness</h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
                A 4-step <span className="text-indigo-400 font-bold">{sessionType}</span> session is ready. 
                <br/><span className="text-xs uppercase tracking-widest opacity-50 font-black">Synthesized ambience enabled</span>
              </p>
              <button onClick={startMeditation} className="px-16 py-6 bg-white text-slate-900 rounded-[28px] font-black uppercase text-xs tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl group flex items-center gap-4">
                <Play size={18} fill="currentColor"/> Commence
              </button>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center max-w-4xl">
              {isGenerating ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-indigo-500 mb-8" size={64} />
                  <p className="text-white font-black uppercase tracking-[0.4em] text-xs">Calibrating Sacred Space...</p>
                </div>
              ) : (
                <div className="space-y-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="w-64 h-64 rounded-full border border-white/5 flex items-center justify-center bg-white/5 backdrop-blur-3xl shadow-2xl relative z-10">
                        <Volume2 className="text-white/30 animate-pulse" size={80} />
                    </div>
                  </div>
                  
                  <div className="max-h-64 px-10 text-center">
                    <p className="text-3xl md:text-5xl font-light text-indigo-50 leading-snug italic animate-fade-in drop-shadow-lg">
                      {transcriptDisplay || 'Soft breath in...'}
                    </p>
                  </div>

                  <button onClick={stopMeditation} className="px-12 py-5 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.5em] border border-white/5 transition-all pointer-events-auto flex items-center gap-4 mx-auto">
                    <Square size={16} fill="currentColor"/> Terminate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
              { icon: <Music className="text-indigo-500"/>, title: "Neural Synthesis", desc: "Ambient drones generated directly by your hardware for lag-free sound." },
              { icon: <Headphones className="text-purple-500"/>, title: "Gapless Queuing", desc: "Sentences are stitched together in real-time for human-like flow." },
              { icon: <Sliders className="text-emerald-500"/>, title: "Sensory Scripts", desc: "No clinical jargon. Just grounded, poetic prompts for deep presence." }
          ].map((card, i) => (
              <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
                 <h4 className="font-black text-slate-900 mb-2 uppercase tracking-widest text-xs">{card.title}</h4>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{card.desc}</p>
              </div>
          ))}
      </div>
    </div>
  );
};

export default Mindfulness;
