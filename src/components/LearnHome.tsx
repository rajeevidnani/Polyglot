import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronRight, ListChecks, MessageSquareQuote } from 'lucide-react';
import { COURSE_LANGUAGES, CourseLanguage, isCourseLanguage } from '../data/learnTypes';
import { coreSentences } from '../data/coreSentences';
import { commonWords } from '../data/commonWords';
import { practisedDays, summarize, useProgressVersion } from '../lib/progress';
import CoreSentences from './CoreSentences';
import WordPractice from './WordPractice';

interface LearnHomeProps {
  userLanguages: string[];
  onHome: () => void;
}

const LAST_LANG_KEY = 'polyglot_last_course_language';
const sentenceIds = coreSentences.map(s => s.id);
const wordIds = commonWords.map(w => w.id);

function lastLanguage(options: CourseLanguage[]): CourseLanguage {
  try {
    const saved = localStorage.getItem(LAST_LANG_KEY);
    if (saved && options.includes(saved as CourseLanguage)) return saved as CourseLanguage;
  } catch {
    // ignore
  }
  return options[0];
}

export default function LearnHome({ userLanguages, onHome }: LearnHomeProps) {
  const chosen = userLanguages.filter(isCourseLanguage);
  const languages = chosen.length ? chosen : [...COURSE_LANGUAGES];
  const [lang, setLang] = useState<CourseLanguage>(() => lastLanguage(languages));
  const [view, setView] = useState<'home' | 'sentences' | 'words'>('home');
  useProgressVersion();

  const pickLanguage = (l: CourseLanguage) => {
    setLang(l);
    try {
      localStorage.setItem(LAST_LANG_KEY, l);
    } catch {
      // ignore
    }
  };

  if (view === 'sentences') return <CoreSentences lang={lang} onBack={() => setView('home')} />;
  if (view === 'words') return <WordPractice lang={lang} onBack={() => setView('home')} />;

  const sentences = summarize(lang, 'sentence', sentenceIds);
  const words = summarize(lang, 'word', wordIds);
  const extraLanguages = userLanguages.filter(l => !isCourseLanguage(l));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full mx-auto py-6">
      <button onClick={onHome} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200 mb-4">
        <ArrowLeft className="w-4 h-4" /> Main menu
      </button>

      <div className="flex flex-wrap gap-2 mb-5">
        {languages.map(l => (
          <button
            key={l}
            onClick={() => pickLanguage(l)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${l === lang ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <PathCard
          step={1}
          icon={<MessageSquareQuote className="w-5 h-5" />}
          title="Core sentences"
          subtitle="Tim Ferriss's deconstruction method: how the language works, in 13 sentences"
          learned={sentences.learned}
          total={sentenceIds.length}
          due={sentences.due}
          onClick={() => setView('sentences')}
        />
        <PathCard
          step={2}
          icon={<ListChecks className="w-5 h-5" />}
          title="Most common words"
          subtitle="The most useful words first, 10 at a time"
          learned={words.learned}
          total={wordIds.length}
          due={words.due}
          onClick={() => setView('words')}
        />
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 flex items-center gap-3">
          <BookOpen className="w-5 h-5 shrink-0" />
          Next up: your own words, and an alphabet guide.
        </div>
      </div>

      <DaysPractised days={practisedDays(lang)} />

      {extraLanguages.length > 0 && (
        <p className="text-xs text-slate-400 mt-4">
          Built-in lessons cover {COURSE_LANGUAGES.join(', ')}. {extraLanguages.join(', ')} can still be used with Practice Custom Phrase.
        </p>
      )}
    </motion.div>
  );
}

interface PathCardProps {
  step: number;
  icon: ReactNode;
  title: string;
  subtitle: string;
  learned: number;
  total: number;
  due: number;
  onClick: () => void;
}

function PathCard({ step, icon, title, subtitle, learned, total, due, onClick }: PathCardProps) {
  const pct = Math.round((learned / total) * 100);
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-300 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {step}</p>
          <p className="font-bold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300" />
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{learned} of {total} learned</span>
          {due > 0 && <span className="font-medium text-amber-600">{due} to review</span>}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </button>
  );
}

function DaysPractised({ days }: { days: string[] }) {
  const set = new Set(days);
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const count = last14.filter(d => set.has(d)).length;

  return (
    <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-700 mb-3">Practised {count} of the last 14 days</p>
      <div className="flex gap-1.5 justify-between">
        {last14.map(d => (
          <div
            key={d}
            title={d}
            className={`h-6 flex-1 rounded-md ${set.has(d) ? 'bg-indigo-500' : 'bg-slate-100'}`}
          />
        ))}
      </div>
    </div>
  );
}
