import { useEffect, useState } from 'react';
import Menu from './components/Menu';
import SentenceLearner from './components/SentenceLearner';
import LearnHome from './components/LearnHome';
import { WordData } from './types';

const DEFAULT_LANGUAGES = ['Dutch', 'Spanish', 'Hindi', 'Sindhi', 'Gujarati'];

function loadLanguages(): string[] {
  try {
    const saved = localStorage.getItem('polyglot_user_languages');
    return saved ? JSON.parse(saved) : DEFAULT_LANGUAGES;
  } catch {
    return DEFAULT_LANGUAGES;
  }
}

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'learn' | 'phrase'>('menu');
  const [words, setWords] = useState<WordData[]>([]);
  const [userLanguages, setUserLanguages] = useState<string[]>(loadLanguages);

  useEffect(() => {
    try {
      localStorage.setItem('polyglot_user_languages', JSON.stringify(userLanguages));
    } catch {
      // ignore
    }
  }, [userLanguages]);

  const handleHome = () => {
    setScreen('menu');
    setWords([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      {screen === 'menu' && (
        <Menu
          onStart={phraseWords => { setWords(phraseWords); setScreen('phrase'); }}
          onLearn={() => setScreen('learn')}
          userLanguages={userLanguages}
          setUserLanguages={setUserLanguages}
        />
      )}
      {screen === 'learn' && <LearnHome userLanguages={userLanguages} onHome={handleHome} />}
      {screen === 'phrase' && <SentenceLearner words={words} onHome={handleHome} />}
    </div>
  );
}
