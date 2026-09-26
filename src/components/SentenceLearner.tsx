import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, Home, Eye, BookOpen, Languages } from 'lucide-react';
import { WordData } from '../types';
import PlayAudioButton from './PlayAudioButton';

interface SentenceLearnerProps {
  words: WordData[];
  onHome: () => void;
}

export default function SentenceLearner({ words, onHome }: SentenceLearnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [scriptMode, setScriptMode] = useState<'romanized' | 'both' | 'native'>('romanized');
  const [isGameOver, setIsGameOver] = useState(false);

  const currentWord = words[currentIndex];
  const languages = currentWord ? Object.keys(currentWord.translations) : [];

  const handleReveal = (lang: string) => {
    setRevealed(prev => ({ ...prev, [lang]: true }));
  };

  const handleRevealAll = () => {
    const all: Record<string, boolean> = {};
    languages.forEach(l => all[l] = true);
    setRevealed(all);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1);
      setRevealed({});
    } else {
      setIsGameOver(true);
    }
  };

  const allRevealed = languages.length > 0 && languages.every(lang => revealed[lang]);

  if (isGameOver) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Study Complete!</h2>
        <p className="text-slate-500 mb-8">
          You've reviewed all the sentences in this lesson.
        </p>
        
        <button
          onClick={onHome}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Menu
        </button>
      </motion.div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="max-w-4xl w-full mx-auto py-8 px-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onHome}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Main Menu</span>
        </button>
        <div className="font-bold text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          Sentence Study
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Sentence {currentIndex + 1} of {words.length}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / words.length) * 100}%` }}
          />
        </div>
      </div>

      <motion.div 
        key={currentWord.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 p-6 md:p-8 text-white text-center">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">
            English Sentence
          </p>
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              "{currentWord.englishSentence}"
            </h2>
            <PlayAudioButton 
              text={currentWord.englishSentence} 
              lang="English" 
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            />
          </div>
          <div className="mt-4 inline-block bg-white/10 px-4 py-2 rounded-full text-indigo-200 text-sm font-medium">
            Focus word: <span className="text-white font-bold">{currentWord.english}</span>
          </div>
        </div>

        {/* Translations Grid */}
        <div className="p-4 md:p-6 bg-slate-50/50">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-lg font-bold text-slate-800">Translations</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setScriptMode(prev => prev === 'romanized' ? 'both' : prev === 'both' ? 'native' : 'romanized')}
                className={`text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shadow-sm ${scriptMode !== 'romanized' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline">{scriptMode === 'romanized' ? 'Script: OFF' : scriptMode === 'both' ? 'Script: BOTH' : 'Script: ONLY'}</span>
              </button>
              {!allRevealed && (
                <button 
                  onClick={handleRevealAll}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Reveal All</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {languages.map(lang => {
              const isRevealed = revealed[lang];

              return (
                <div 
                  key={lang} 
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                    isRevealed ? 'border-indigo-200 bg-white' : 'border-slate-200 bg-white cursor-pointer hover:border-indigo-300 hover:shadow-md'
                  }`}
                  onClick={() => !isRevealed && handleReveal(lang)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 text-lg">{lang}</h4>
                    {!isRevealed && (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                        <Eye className="w-3 h-3" /> Tap to reveal
                      </span>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {isRevealed ? (
                      <motion.div
                        key="revealed"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xl text-slate-700 font-medium italic leading-relaxed">
                              "{scriptMode === 'native' && currentWord.translations[lang].nativeSentence ? currentWord.translations[lang].nativeSentence : currentWord.translations[lang].sentence}"
                            </p>
                            {scriptMode === 'both' && currentWord.translations[lang].nativeSentence && (
                              <p className="text-xl text-slate-800 font-medium leading-relaxed">
                                {currentWord.translations[lang].nativeSentence}
                              </p>
                            )}
                          </div>
                          <PlayAudioButton 
                            text={currentWord.translations[lang].nativeSentence || currentWord.translations[lang].sentence} 
                            lang={lang} 
                            className="mt-1 shrink-0"
                          />
                        </div>
                        <div className="inline-block bg-indigo-50 px-3 py-1.5 rounded-lg mt-1">
                          <p className="text-sm text-indigo-700 font-bold flex items-center gap-2">
                            <span>
                              Word: {scriptMode === 'native' && currentWord.translations[lang].nativeWord ? currentWord.translations[lang].nativeWord : currentWord.translations[lang].word}
                              {scriptMode === 'both' && currentWord.translations[lang].nativeWord && ` (${currentWord.translations[lang].nativeWord})`}
                            </span>
                            <PlayAudioButton 
                              text={currentWord.translations[lang].nativeWord || currentWord.translations[lang].word} 
                              lang={lang} 
                            />
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-16 flex flex-col justify-center gap-2"
                      >
                        <div className="w-full h-3 bg-slate-100 rounded-full animate-pulse" />
                        <div className="w-2/3 h-3 bg-slate-100 rounded-full animate-pulse" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleNext}
            disabled={!allRevealed}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
              allRevealed 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {currentIndex < words.length - 1 ? 'Next Sentence' : 'Finish Study'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
