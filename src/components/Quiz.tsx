import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, Trophy, Home, Languages } from 'lucide-react';
import { WordData } from '../types';
import PlayAudioButton from './PlayAudioButton';

interface QuizProps {
  words: WordData[];
  onHome: () => void;
}

export default function Quiz({ words, onHome }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | null>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [scriptMode, setScriptMode] = useState<'romanized' | 'both' | 'native'>('romanized');
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentWord = words[currentIndex];
  const languages = currentWord ? Object.keys(currentWord.translations) : [];

  // Generate options (1 correct, 3 random wrong from the set) for each language
  const options = useMemo(() => {
    if (!currentWord) return {};
    
    const optionsMap: Record<string, any[]> = {};

    languages.forEach(lang => {
      const correctTrans = currentWord.translations[lang];
      const otherTrans = words
        .filter(w => w.id !== currentWord.id && w.translations[lang])
        .map(w => w.translations[lang]);
      
      // Shuffle other words and take up to 3
      const shuffledOthers = otherTrans.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      // Combine and shuffle all options
      optionsMap[lang] = [correctTrans, ...shuffledOthers].sort(() => 0.5 - Math.random());
    });

    return optionsMap;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord, words]);

  const handleOptionClick = (lang: string, option: string) => {
    if (isChecked) return; // Prevent changes after checking
    setSelections(prev => ({ ...prev, [lang]: option }));
  };

  const handleCheck = () => {
    setIsChecked(true);
    let points = 0;
    languages.forEach(lang => {
      if (selections[lang] === currentWord.translations[lang].word) {
        points += 1;
      }
    });
    setScore(s => s + points);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelections({});
      setIsChecked(false);
    } else {
      setIsGameOver(true);
    }
  };

  const allSelected = languages.length > 0 && languages.every(lang => selections[lang]);
  const maxPossibleScore = words.length * (words[0] ? Object.keys(words[0].translations).length : 4);

  if (isGameOver) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Lesson Complete!</h2>
        <p className="text-slate-500 mb-8">
          You scored <span className="font-bold text-slate-900">{score}</span> out of {maxPossibleScore}
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
          Word Quiz
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Word {currentIndex + 1} of {words.length}</span>
          <span>Score: {score} / {maxPossibleScore}</span>
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
        {/* Question Header */}
        <div className="bg-slate-900 p-6 md:p-8 text-white text-center relative">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
            Translate
          </p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-4xl font-bold">"{currentWord.english}"</h2>
            <PlayAudioButton 
              text={currentWord.english} 
              lang="English" 
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            />
          </div>
          <p className="text-slate-300 italic text-lg">
            "{currentWord.englishSentence.replace(new RegExp(`\\b${currentWord.english}\\b`, 'gi'), '___')}"
          </p>
        </div>

        {/* Options Grid */}
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 bg-slate-50/50 relative">
          {/* Toggle Native Script */}
          <div className="absolute -top-12 right-6 lg:right-8">
            <button 
              onClick={() => setScriptMode(prev => prev === 'romanized' ? 'both' : prev === 'both' ? 'native' : 'romanized')}
              className={`text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors shadow-sm ${scriptMode !== 'romanized' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              <Languages className="w-4 h-4" />
              {scriptMode === 'romanized' ? 'Script: OFF' : scriptMode === 'both' ? 'Script: BOTH' : 'Script: ONLY'}
            </button>
          </div>

          {languages.map(lang => {
            const isLangCorrect = isChecked && selections[lang] === currentWord.translations[lang].word;
            const isLangWrong = isChecked && selections[lang] !== currentWord.translations[lang].word;

            return (
              <div key={lang} className={`p-4 md:p-5 rounded-2xl border-2 transition-colors shadow-sm ${
                !isChecked ? 'border-slate-200 bg-white' :
                isLangCorrect ? 'border-emerald-200 bg-emerald-50/80' :
                'border-rose-200 bg-rose-50/80'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">{lang}</h3>
                  {isChecked && (
                    isLangCorrect 
                      ? <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md"><CheckCircle2 className="w-4 h-4"/> +1</span>
                      : <span className="flex items-center gap-1 text-sm font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-md"><XCircle className="w-4 h-4"/> 0</span>
                  )}
                </div>

                <div className="mb-4 p-3 bg-slate-100/50 rounded-xl border border-slate-200">
                  <p className="text-slate-600 italic text-sm text-center">
                    "{currentWord.translations[lang].sentence.replace(new RegExp(`\\b${currentWord.translations[lang].word}\\b`, 'gi'), '___')}"
                  </p>
                  {scriptMode === 'both' && currentWord.translations[lang].nativeSentence && currentWord.translations[lang].nativeWord && (
                    <p className="text-slate-700 font-medium text-sm text-center mt-1">
                      {currentWord.translations[lang].nativeSentence.replace(new RegExp(`\\b${currentWord.translations[lang].nativeWord}\\b`, 'gi'), '___')}
                    </p>
                  )}
                  {scriptMode === 'native' && currentWord.translations[lang].nativeSentence && currentWord.translations[lang].nativeWord && (
                    <p className="text-slate-700 font-medium text-sm text-center mt-1">
                      {currentWord.translations[lang].nativeSentence.replace(new RegExp(`\\b${currentWord.translations[lang].nativeWord}\\b`, 'gi'), '___')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {options[lang].map((option, idx) => {
                    const isSelected = selections[lang] === option.word;
                    const isActuallyCorrect = option.word === currentWord.translations[lang].word;
                    
                    let buttonClass = "p-3 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between ";
                    
                    if (!isChecked) {
                      buttonClass += isSelected 
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                        : "border-slate-200 hover:border-indigo-300 bg-white text-slate-700";
                    } else {
                      if (isActuallyCorrect) {
                        buttonClass += "border-emerald-500 bg-emerald-100 text-emerald-800";
                      } else if (isSelected && !isActuallyCorrect) {
                        buttonClass += "border-rose-500 bg-rose-100 text-rose-800";
                      } else {
                        buttonClass += "border-slate-200 bg-white text-slate-400 opacity-50";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(lang, option.word)}
                        disabled={isChecked}
                        className={buttonClass}
                      >
                        <div className="flex flex-col">
                          <span>{scriptMode === 'native' && option.nativeWord ? option.nativeWord : option.word}</span>
                          {scriptMode === 'both' && option.nativeWord && (
                            <span className="text-sm opacity-75 mt-0.5 font-medium">{option.nativeWord}</span>
                          )}
                        </div>
                        {isChecked && isActuallyCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {isChecked && isSelected && !isActuallyCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {isChecked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-slate-200/60"
                    >
                      <p className="text-sm font-medium text-slate-500 mb-1">Example:</p>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-slate-800 italic">"{scriptMode === 'native' && currentWord.translations[lang].nativeSentence ? currentWord.translations[lang].nativeSentence : currentWord.translations[lang].sentence}"</p>
                          {scriptMode === 'both' && currentWord.translations[lang].nativeSentence && (
                            <p className="text-slate-700 mt-1 font-medium">{currentWord.translations[lang].nativeSentence}</p>
                          )}
                        </div>
                        <PlayAudioButton 
                          text={currentWord.translations[lang].nativeSentence || currentWord.translations[lang].sentence} 
                          lang={lang} 
                          className="mt-1 shrink-0"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          {!isChecked ? (
            <button
              onClick={handleCheck}
              disabled={!allSelected}
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answers
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors bg-slate-900 hover:bg-slate-800 text-white"
            >
              {currentIndex < words.length - 1 ? 'Next Word' : 'Finish Lesson'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
