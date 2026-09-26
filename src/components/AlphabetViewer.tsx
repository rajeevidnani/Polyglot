import { useState } from 'react';
import { motion } from 'motion/react';
import { Home, Languages } from 'lucide-react';
import { alphabetsData } from '../data/alphabets';
import { Language } from '../types';

interface AlphabetViewerProps {
  onHome: () => void;
}

const LANGUAGES: Language[] = ['Spanish', 'Hindi', 'Sindhi', 'Gujarati'];

export default function AlphabetViewer({ onHome }: AlphabetViewerProps) {
  const [selectedLang, setSelectedLang] = useState<Language>('Spanish');

  const currentAlphabet = alphabetsData[selectedLang] || [];
  
  // Group letters by their 'group' property
  const groupedAlphabet = currentAlphabet.reduce((acc, letter) => {
    const group = letter.group || 'Letters';
    if (!acc[group]) acc[group] = [];
    acc[group].push(letter);
    return acc;
  }, {} as Record<string, typeof currentAlphabet>);

  return (
    <div className="max-w-5xl w-full mx-auto py-8 px-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onHome}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Main Menu</span>
        </button>
        <div className="font-bold text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-600" />
          Alphabet Reference
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Language Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`flex-1 min-w-[120px] py-4 px-6 text-sm font-bold transition-colors border-b-2 ${
                selectedLang === lang 
                  ? 'border-indigo-600 text-indigo-700 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Alphabet Grid */}
        <div className="p-6 md:p-8 bg-slate-50/50 min-h-[500px]">
          {Object.entries(groupedAlphabet).map(([groupName, letters]) => (
            <div key={groupName} className="mb-10 last:mb-0">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                {groupName}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {letters.map((letter, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <span className="text-3xl md:text-4xl font-medium text-slate-900 mb-2" style={{ fontFamily: selectedLang === 'Sindhi' ? 'Arial, sans-serif' : 'inherit' }}>
                      {letter.native}
                    </span>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg w-full">
                      {letter.romanized}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
