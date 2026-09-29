import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { commonWords } from '../data/commonWords';
import { CommonWord, CourseLanguage } from '../data/learnTypes';
import { buildSession, getItem, recordAnswer, summarize, LEARNED_BOX } from '../lib/progress';
import NativeText from './NativeText';
import PlayAudioButton from './PlayAudioButton';

interface WordPracticeProps {
  lang: CourseLanguage;
  onBack: () => void;
}

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

function newSession(lang: CourseLanguage): string[] {
  const session = buildSession(lang, 'word', ids, SESSION_SIZE);
  if (session.length) return session;
  // Everything is learned and nothing is due: practise the weakest ones anyway.
  return [...ids].sort((a, b) => (getItem(lang, 'word', a)?.box ?? 0) - (getItem(lang, 'word', b)?.box ?? 0)).slice(0, SESSION_SIZE);
}

export default function WordPractice({ lang, onBack }: WordPracticeProps) {
  const [queue, setQueue] = useState(() => newSession(lang));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);

  const word = byId[queue[index]];
  const options = useMemo(() => (word ? optionsFor(word, lang) : []), [word, lang]);

  const restart = () => {
    setQueue(newSession(lang));
    setIndex(0);
    setPicked(null);
    setRight(0);
  };

  if (!word) {
    const s = summarize(lang, 'word', ids);
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900">Round done</h3>
        <p className="text-slate-600 mt-1">{right} of {queue.length} right.</p>
        <p className="text-slate-600">{s.learned} of {ids.length} {lang} words learned so far.</p>
        <div className="flex gap-2 mt-6">
          <button onClick={onBack} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">Done</button>
          <button onClick={restart} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700">
            <RotateCcw className="w-4 h-4 inline mr-1" /> 10 more
          </button>
        </div>
      </div>
    );
  }

  const isNew = !getItem(lang, 'word', word.id);
  const choose = (id: string) => {
    if (picked) return;
    setPicked(id);
    const correct = id === word.id;
    if (correct) setRight(r => r + 1);
    recordAnswer(lang, 'word', word.id, correct);
  };
  const next = () => {
    setPicked(null);
    setIndex(i => i + 1);
  };
  const t = word.tr[lang];
  const nowLearned = (getItem(lang, 'word', word.id)?.box ?? 0) >= LEARNED_BOX;

  return (
    <div className="max-w-md w-full mx-auto py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div key={word.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-slate-100">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(index / queue.length) * 100}%` }} />
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-center mb-1">
            {index + 1} of {queue.length} · {word.theme} {isNew && !picked && '· New word'}
          </p>
          <p className="text-3xl font-bold text-slate-900 text-center mb-6">{word.english}</p>

          <div className="grid grid-cols-2 gap-3">
            {options.map(o => {
              const isAnswer = o.id === word.id;
              const state = !picked ? 'idle' : isAnswer ? 'right' : o.id === picked ? 'wrong' : 'dim';
              return (
                <button
                  key={o.id}
                  onClick={() => choose(o.id)}
                  disabled={!!picked}
                  className={`min-h-24 p-3 rounded-xl border-2 transition-colors flex items-center justify-center text-center ${
                    state === 'idle' ? 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50' :
                    state === 'right' ? 'border-emerald-400 bg-emerald-50' :
                    state === 'wrong' ? 'border-rose-300 bg-rose-50' : 'border-slate-100 opacity-50'
                  }`}
                >
                  <NativeText lang={lang} value={o.tr[lang]} size="sm" />
                </button>
              );
            })}
          </div>

          {picked && (
            <div className="mt-5">
              <div className={`flex items-center justify-center gap-2 text-sm font-medium mb-3 ${picked === word.id ? 'text-emerald-600' : 'text-rose-600'}`}>
                {picked === word.id ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {picked === word.id ? (nowLearned ? 'Right, and now learned' : 'Right') : "Not quite. It'll come back soon."}
              </div>
              <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-xl p-3 mb-4">
                <NativeText lang={lang} value={t} />
                <PlayAudioButton text={t.n ?? t.r} lang={lang} />
              </div>
              <button onClick={next} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
