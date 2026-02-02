
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, Volume2, SkipBack, SkipForward, Loader2, AlertCircle } from 'lucide-react';
import { AudioTrack } from '../types';

interface AudioPlayerProps {
    track: AudioTrack | null;
    onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (track) {
            setIsPlaying(false);
            setIsLoading(true);
            setError(null);
            setProgress(0);
            
            if(audioRef.current) {
                audioRef.current.load();
                const playPromise = audioRef.current.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                            setIsLoading(false);
                        })
                        .catch(e => {
                            console.warn("Autoplay was prevented or resource could not be loaded.");
                            setIsPlaying(false);
                            setIsLoading(false);
                        });
                }
            }
        }
    }, [track]);

    const togglePlay = () => {
        if (!audioRef.current || isLoading) return;
        
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
                setError(null);
            }).catch(() => {
                setError("Playback failed. Please check connection.");
            });
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 1;
            setProgress((current / duration) * 100);
        }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleAudioError = () => {
        setError("Source load failed. Retrying...");
        setIsLoading(false);
        setIsPlaying(false);
        // Attempt a one-time retry after 2 seconds if it's a transient network issue
        setTimeout(() => {
            if (audioRef.current && track) {
                audioRef.current.load();
            }
        }, 2000);
    };

    if (!track) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.15)] p-4 md:pl-72 md:pr-80 animate-fade-in-up">
            <audio 
                ref={audioRef} 
                src={track.url} 
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onLoadStart={handleLoadStart}
                onCanPlay={handleCanPlay}
                onError={handleAudioError}
                preload="auto"
            />
            
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 overflow-hidden flex-shrink-0 border border-indigo-100 shadow-inner flex items-center justify-center relative">
                        {track.image ? (
                            <img src={track.image} alt={track.title} className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-30' : 'opacity-100'}`} />
                        ) : (
                            <Volume2 className="text-indigo-300" size={20} />
                        )}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="animate-spin text-indigo-500" size={16} />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-2">
                            {track.title}
                            {error && <AlertCircle size={12} className="text-amber-500 animate-pulse" />}
                        </h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
                            {error ? <span className="text-amber-600">{error}</span> : track.artist}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
                    <div className="flex items-center gap-6">
                        <button className="text-slate-300 hover:text-indigo-600 transition-colors disabled:opacity-30" disabled={isLoading}>
                            <SkipBack size={20} />
                        </button>
                        <button 
                            onClick={togglePlay}
                            disabled={isLoading}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                                isLoading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100'
                            }`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : isPlaying ? (
                                <Pause size={20} fill="currentColor" />
                            ) : (
                                <Play size={20} fill="currentColor" className="ml-0.5" />
                            )}
                        </button>
                        <button className="text-slate-300 hover:text-indigo-600 transition-colors disabled:opacity-30" disabled={isLoading}>
                            <SkipForward size={20} />
                        </button>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative">
                        <div 
                            className="h-full bg-indigo-600 transition-all duration-300 relative z-10" 
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border-2 border-indigo-600 shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="hidden sm:flex items-center gap-2 text-slate-400">
                        <Volume2 size={16} />
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-300 w-3/4"></div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100">
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
