import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Languages, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { commonWords } from '../data/commonWords';
import { CommonWord, CourseLanguage, Rendering } from '../data/learnTypes';
import { buildMultiSession, getItem, recordAnswer, summarize } from '../lib/progress';
import { useSindhiScript, SindhiScript } from '../lib/script';
import PlayAudioButton from './PlayAudioButton';

interface WordPracticeProps {
  languages: CourseLanguage[];
  onBack: () => void;
}

type ScriptMode = 'romanized' | 'both' | 'native';

const SESSION_SIZE = 10;
const ids = commonWords.map(w => w.id);
const byId = Object.fromEntries(commonWords.map(w => [w.id, w]));

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Three wrong answers, preferring the same theme (harder), never one that looks identical to the right answer.
function optionsFor(word: CommonWord, lang: CourseLanguage): CommonWord[] {
  const answer = word.tr[lang].r;
  const pool = commonWords.filter(w => w.id !== word.id && w.tr[lang].r !== answer);
  const sameTheme = shuffle(pool.filter(w => w.theme === word.theme));
  const others = shuffle(pool.filter(w => w.theme !== word.theme));
  return shuffle([word, ...[...sameTheme, ...others].slice(0, 3)]);
}

function newSession(languages: CourseLanguage[]): string[] {
  const session = buildMultiSession(languages, 'word', ids, SESSION_SIZE);
  if (session.length) return session;
  // Everything learned and nothing due: practise the weakest ones anyway.
  const weakest = (id: string) => Math.min(...languages.map(l => getItem(l, 'word', id)?.box ?? 0));
  return [...ids].sort((a, b) => weakest(a) - weakest(b)).slice(0, SESSION_SIZE);
}

function nativeOf(lang: CourseLanguage, value: Rendering, sindhi: SindhiScript): string | undefined {
  if (lang !== 'Sindhi') return value.n;
  if (sindhi === 'arabic') return value.n;
  if (sindhi === 'devanagari') return value.d;
  return [value.n, value.d].filter(Boolean).join(' · ');
}

export default function WordPractice({ languages, onBack }: WordPracticeProps) {
  const [queue, setQueue] = useState(() => newSession(languages));
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<Record<CourseLanguage, string>>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [scriptMode, setScriptMode] = useState<ScriptMode>('both');
  const sindhi = useSindhiScript();

  const word = byId[queue[index]];
  const options = useMemo(() => {
    if (!word) return {} as Record<CourseLanguage, CommonWord[]>;
    return Object.fromEntries(languages.map(l => [l, optionsFor(word, l)])) as Record<CourseLanguage, CommonWord[]>;
  }, [word, languages]);

  const restart = () => {
    setQueue(newSession(languages));
    setIndex(0);
    setSelections({});
    setIsChecked(false);
    setScore(0);
  };

  if (!word) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Round done</h2>
        <p className="text-slate-500 mb-4">{score} of {queue.length * languages.length} right</p>
        <div className="text-sm text-slate-600 space-y-1 mb-8">
          {languages.map(l => (
            <p key={l}>{l}: {summarize(l, 'word', ids).learned} of {ids.length} words learned</p>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">Done</button>
          <button onClick={restart} className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> 10 more
          </button>
        </div>
      </motion.div>
    );
  }

  const allSelected = languages.every(l => selections[l]);

  const handleCheck = () => {
    setIsChecked(true);
    let points = 0;
    languages.forEach(l => {
      const correct = selections[l] === word.id;
      if (correct) points += 1;
      recordAnswer(l, 'word', word.id, correct);
    });
    setScore(s => s + points);
  };

  const handleNext = () => {
    setSelections({});
    setIsChecked(false);
    setIndex(i => i + 1);
  };

  return (
    <div className="max-w-4xl w-full mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="font-bold text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">Word Quiz</div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Word {index + 1} of {queue.length}</span>
          <span>Score: {score} / {queue.length * languages.length}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div className="h-full bg-indigo-600" initial={{ width: 0 }} animate={{ width: `${(index / queue.length) * 100}%` }} />
        </div>
      </div>

      <motion.div key={word.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-6 md:p-8 text-white text-center relative">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Translate</p>
          <h2 className="text-4xl font-bold mb-2">"{word.english}"</h2>
          <p className="text-slate-400 text-sm">{word.theme}</p>
        </div>

        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 bg-slate-50/50 relative">
          <div className="absolute -top-12 right-6 lg:right-8">
            <button
              onClick={() => setScriptMode(prev => (prev === 'romanized' ? 'both' : prev === 'both' ? 'native' : 'romanized'))}
              className={`text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors shadow-sm ${scriptMode !== 'romanized' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              <Languages className="w-4 h-4" />
              {scriptMode === 'romanized' ? 'Script: OFF' : scriptMode === 'both' ? 'Script: BOTH' : 'Script: ONLY'}
            </button>
          </div>

          {languages.map(lang => {
            const answer = word.tr[lang];
            const isLangCorrect = isChecked && selections[lang] === word.id;
            return (
              <div key={lang} className={`p-4 md:p-5 rounded-2xl border-2 transition-colors shadow-sm ${!isChecked ? 'border-slate-200 bg-white' : isLangCorrect ? 'border-emerald-200 bg-emerald-50/80' : 'border-rose-200 bg-rose-50/80'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">{lang}</h3>
                  {isChecked && (isLangCorrect
                    ? <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md"><CheckCircle2 className="w-4 h-4" /> +1</span>
                    : <span className="flex items-center gap-1 text-sm font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-md"><XCircle className="w-4 h-4" /> 0</span>)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {options[lang].map(option => {
                    const value = option.tr[lang];
                    const native = nativeOf(lang, value, sindhi);
                    const isSelected = selections[lang] === option.id;
                    const isActuallyCorrect = option.id === word.id;
                    let buttonClass = 'p-3 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between ';
                    if (!isChecked) {
                      buttonClass += isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300 bg-white text-slate-700';
                    } else if (isActuallyCorrect) {
                      buttonClass += 'border-emerald-500 bg-emerald-100 text-emerald-800';
                    } else if (isSelected) {
                      buttonClass += 'border-rose-500 bg-rose-100 text-rose-800';
                    } else {
                      buttonClass += 'border-slate-200 bg-white text-slate-400 opacity-50';
                    }
                    return (
                      <button
                        key={option.id}
                        onClick={() => !isChecked && setSelections(prev => ({ ...prev, [lang]: option.id }))}
                        disabled={isChecked}
                        className={buttonClass}
                      >
                        <div className="flex flex-col">
                          <span>{scriptMode === 'native' && native ? native : value.r}</span>
                          {scriptMode === 'both' && native && <span className="text-sm opacity-75 mt-0.5 font-medium">{native}</span>}
                        </div>
                        {isChecked && isActuallyCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {isChecked && isSelected && !isActuallyCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {isChecked && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-slate-800 font-medium">{answer.r}</p>
                        {nativeOf(lang, answer, sindhi) && <p className="text-slate-700">{nativeOf(lang, answer, sindhi)}</p>}
                      </div>
                      <PlayAudioButton text={answer.n ?? answer.r} lang={lang} className="shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          {!isChecked ? (
            <button onClick={handleCheck} disabled={!allSelected} className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
              Check Answers
            </button>
          ) : (
            <button onClick={handleNext} className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors bg-slate-900 hover:bg-slate-800 text-white">
              {index < queue.length - 1 ? 'Next Word' : 'Finish Lesson'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
