import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Check, Eye, RotateCcw, Sparkles } from 'lucide-react';
import { coreSentences } from '../data/coreSentences';
import { CourseLanguage } from '../data/learnTypes';
import { buildSession, getItem, LEARNED_BOX, recordAnswer, useProgressVersion } from '../lib/progress';
import NativeText from './NativeText';
import PlayAudioButton from './PlayAudioButton';

interface CoreSentencesProps {
  lang: CourseLanguage;
  onBack: () => void;
}

const FERRISS_URL = 'https://tim.blog/2007/11/07/how-to-learn-but-not-master-any-language-in-1-hour-plus-a-favor/';
const ids = coreSentences.map(s => s.id);
const byId = Object.fromEntries(coreSentences.map(s => [s.id, s]));

export default function CoreSentences({ lang, onBack }: CoreSentencesProps) {
  const [mode, setMode] = useState<'study' | 'practise'>('study');
  useProgressVersion();

  return (
    <div className="max-w-2xl w-full mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
          {(['study', 'practise'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${mode === m ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Core sentences · {lang}</h2>
        <p className="text-sm text-slate-600 mt-1">
          Based on Tim Ferriss's{' '}
          <a href={FERRISS_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">deconstruction method</a>.
          A handful of sentences that show how a language works: word order, gender, "not", "must" and "want".
          Learn these first and new words slot straight into them.
        </p>
      </div>

      {mode === 'study' ? <StudyList lang={lang} /> : <Practise lang={lang} onDone={() => setMode('study')} />}

      <p className="text-xs text-slate-400 text-center mt-6">
        Translations drafted with AI help. If something looks off, check with a native speaker.
      </p>
    </div>
  );
}

function StudyList({ lang }: { lang: CourseLanguage }) {
  return (
    <div className="space-y-3">
      {coreSentences.map((s, i) => {
        const t = s.tr[lang];
        const p = getItem(lang, 'sentence', s.id);
        const learned = p && p.box >= LEARNED_BOX;
        return (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {i + 1} · {s.source === 'ferriss' ? 'Ferriss' : 'Extra'} · {s.teaches}
              </span>
              {learned && <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><Check className="w-3.5 h-3.5" /> Learned</span>}
            </div>
            <p className="text-slate-800 font-medium mb-2">{s.english}</p>
            <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-xl p-3">
              <NativeText lang={lang} value={t} />
              <PlayAudioButton text={t.n ?? t.r} lang={lang} />
            </div>
            <p className="text-sm text-slate-600 mt-2">💡 {t.note}</p>
          </div>
        );
      })}
    </div>
  );
}

function Practise({ lang, onDone }: { lang: CourseLanguage; onDone: () => void }) {
  const [queue] = useState(() => {
    const session = buildSession(lang, 'sentence', ids, ids.length);
    return session.length ? session : ids;
  });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [knew, setKnew] = useState(0);

  if (index >= queue.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900">Round done</h3>
        <p className="text-slate-600 mt-1">You knew {knew} of {queue.length}. The ones you missed will come back sooner.</p>
        <div className="flex gap-2 mt-6">
          <button onClick={onDone} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">
            <BookOpen className="w-4 h-4 inline mr-1" /> Study list
          </button>
          <button onClick={() => { setIndex(0); setRevealed(false); setKnew(0); }} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700">
            <RotateCcw className="w-4 h-4 inline mr-1" /> Go again
          </button>
        </div>
      </div>
    );
  }

  const s = byId[queue[index]];
  const t = s.tr[lang];

  const answer = (correct: boolean) => {
    recordAnswer(lang, 'sentence', s.id, correct);
    if (correct) setKnew(k => k + 1);
    setRevealed(false);
    setIndex(i => i + 1);
  };

  return (
    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-1.5 bg-slate-100">
        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(index / queue.length) * 100}%` }} />
      </div>
      <div className="p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
          {index + 1} of {queue.length} · Say it in {lang}
        </p>
        <p className="text-2xl font-bold text-slate-900 mb-6">{s.english}</p>

        {revealed ? (
          <>
            <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-xl p-4 mb-3">
              <NativeText lang={lang} value={t} size="lg" />
              <PlayAudioButton text={t.n ?? t.r} lang={lang} />
            </div>
            <p className="text-sm text-slate-600 mb-6">💡 {t.note}</p>
            <div className="flex gap-2">
              <button onClick={() => answer(false)} className="flex-1 py-3 rounded-xl bg-rose-50 text-rose-700 font-medium hover:bg-rose-100 border border-rose-100">Not yet</button>
              <button onClick={() => answer(true)} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700">I knew it</button>
            </div>
          </>
        ) : (
          <button onClick={() => setRevealed(true)} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" /> Show answer
          </button>
        )}
      </div>
    </motion.div>
  );
}
