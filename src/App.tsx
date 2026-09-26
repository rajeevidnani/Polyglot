import { useState } from 'react';
import Menu, { PlayMode } from './components/Menu';
import Quiz from './components/Quiz';
import SentenceLearner from './components/SentenceLearner';
import { WordData } from './types';

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'quiz' | 'sentences'>('menu');
  const [words, setWords] = useState<WordData[]>([]);

  const handleStart = (mode: PlayMode, selectedWords: WordData[]) => {
    setWords(selectedWords);
    setGameState(mode);
  };

  const handleHome = () => {
    setGameState('menu');
    setWords([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      {gameState === 'menu' && (
        <Menu onStart={handleStart} />
      )}
      
      {gameState === 'quiz' && (
        <Quiz 
          words={words} 
          onHome={handleHome} 
        />
      )}

      {gameState === 'sentences' && (
        <SentenceLearner 
          words={words} 
          onHome={handleHome} 
        />
      )}
    </div>
  );
}

