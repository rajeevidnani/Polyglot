import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { generateSpeech } from '../services/gemini';
import { playBase64Audio, getAudioContext } from '../utils/audio';

interface PlayAudioButtonProps {
  text: string;
  lang: string;
  className?: string;
}

export default function PlayAudioButton({ text, lang, className = '' }: PlayAudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (e: MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent clicks
    if (isPlaying) return;
    
    // Initialize and resume AudioContext immediately on user interaction
    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    
    setIsPlaying(true);
    try {
      const base64Audio = await generateSpeech(text, lang);
      await playBase64Audio(base64Audio);
    } catch (err) {
      console.error("Failed to play audio:", err);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-indigo-600 disabled:opacity-50 ${className}`}
      title={`Listen in ${lang}`}
    >
      {isPlaying ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
}
