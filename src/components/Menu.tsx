import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Globe2, Loader2, MessageSquare, Languages, ArrowRight, Mic, MicOff, Settings } from 'lucide-react';
import { WordData } from '../types';
import { generatePhrasePractice, isBusy } from '../services/gemini';
import { initialWords } from '../data/words';
import { PWAInstallButton } from './PWAInstallButton';

import { LiveVoiceCoach } from './LiveVoiceCoach';
import { SettingsModal } from './SettingsModal';
import { useApiKey } from '../lib/apiKey';

export type PlayMode = 'quiz' | 'sentences';

interface MenuProps {
  onStart: (mode: PlayMode, words: WordData[]) => void;
}

export default function Menu({ onStart }: MenuProps) {
  const [mode, setMode] = useState<PlayMode>('quiz');
  const [phrase, setPhrase] = useState('');
  const [userLanguages, setUserLanguages] = useState<string[]>(() => {
    const saved = localStorage.getItem('polyglot_user_languages');
    return saved ? JSON.parse(saved) : ['Dutch', 'Spanish', 'Hindi', 'Sindhi', 'Gujarati'];
  });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(userLanguages);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingAction, setPendingAction] = useState<'basic' | 'custom' | null>(null);
  const apiKey = useApiKey();
  
  useEffect(() => {
    localStorage.setItem('polyglot_user_languages', JSON.stringify(userLanguages));
    setSelectedLanguages(prev => prev.filter(l => userLanguages.includes(l)));
  }, [userLanguages]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPhrase(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = (e: any) => {
      console.error('Speech error', e);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const confirmAction = async () => {
    if (selectedLanguages.length === 0) {
      setError('Please select at least one target language');
      return;
    }
    
    if (pendingAction === 'basic') {
      const shuffled = [...initialWords].sort(() => 0.5 - Math.random());
      
      const filteredWords = shuffled.slice(0, 10).map(word => {
        const filteredTranslations: Record<string, any> = {};
        selectedLanguages.forEach(lang => {
          if (word.translations[lang]) {
            filteredTranslations[lang] = word.translations[lang];
          }
        });
        return { ...word, translations: filteredTranslations };
      }).filter(word => Object.keys(word.translations).length > 0);
      
      setPendingAction(null);
      onStart(mode, filteredWords);
    } else if (pendingAction === 'custom') {
      setPendingAction(null);
      setIsGenerating(true);
      setError('');
      
      try {
        const newWords = await generatePhrasePractice(phrase, selectedLanguages.join(', '));
        onStart('sentences', newWords);
      } catch (err) {
        console.error(err);
        setError(isBusy(err)
          ? 'Gemini is very busy right now. Please try again in a minute.'
          : 'Failed to generate translations. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleGeneratePhraseClick = () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    if (!phrase.trim()) {
      setError('Please enter a phrase');
      return;
    }
    setError('');
    setPendingAction('custom');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden"
    >
      <div className="bg-indigo-600 p-8 text-center text-white relative">
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 p-2 text-indigo-200 hover:text-white hover:bg-indigo-500 rounded-full transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <Globe2 className="w-16 h-16 mx-auto mb-4 opacity-90" />
        <h1 className="text-3xl font-bold tracking-tight">Polyglot</h1>
        <p className="text-indigo-100 mt-2">Master words & sentences in any language</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid gap-6 auto-rows-fr">
          <div className="flex flex-col bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <BookOpen className="w-24 h-24 text-indigo-600" />
            </div>
            <div className="flex items-center gap-2 mb-1 relative z-10">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900">Most Common</h3>
                <p className="text-xs text-indigo-600/70">Start with the essential vocabulary</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-3 flex-1 justify-end relative z-10">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('quiz')}
                  className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-colors ${
                    mode === 'quiz' 
                      ? 'bg-white border-indigo-400 text-indigo-700 shadow-sm' 
                      : 'bg-indigo-100/50 border-transparent text-indigo-600 hover:bg-white hover:border-indigo-200'
                  }`}
                >
                  Words
                </button>
                <button
                  onClick={() => setMode('sentences')}
                  className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-colors ${
                    mode === 'sentences' 
                      ? 'bg-white border-indigo-400 text-indigo-700 shadow-sm' 
                      : 'bg-indigo-100/50 border-transparent text-indigo-600 hover:bg-white hover:border-indigo-200'
                  }`}
                >
                  Sentences
                </button>
              </div>
              <button
                onClick={() => setPendingAction('basic')}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 px-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
              >
                {mode === 'quiz' ? 'Begin Quiz' : 'Begin Study'}
              </button>
            </div>
          </div>

          <div className="flex flex-col bg-teal-50 p-5 rounded-2xl border border-teal-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <MessageSquare className="w-24 h-24 text-teal-600" />
            </div>
            <div className="flex items-center gap-2 mb-1 relative z-10">
              <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-teal-900">Practice Custom Phrase</h3>
                <p className="text-xs text-teal-600/70">Master any conversation flow in all languages</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-3 flex-1 justify-end relative z-10">
              <div className="relative">
                <textarea
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  placeholder="e.g. Yes, I do speak Dutch, I learned it in elementary school..."
                  rows={3}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white resize-none text-sm"
                />
                <button
                  onClick={toggleRecording}
                  className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-rose-100 text-rose-600 animate-pulse' 
                      : 'bg-teal-50 text-teal-500 hover:bg-teal-100 hover:text-teal-700'
                  }`}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
              
              <button
                onClick={handleGeneratePhraseClick}
                disabled={isGenerating}
                className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : apiKey ? 'Translate & Practice' : 'Add your Gemini key to use this'}
              </button>
            </div>
            {error && <p className="text-sm text-rose-500 mt-2 relative z-10">{error}</p>}
          </div>
          
          <LiveVoiceCoach AVAILABLE_LANGUAGES={userLanguages} />
          
        </div>
        <PWAInstallButton />
      </div>

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Select Target Languages</h3>
              <p className="text-sm text-slate-500 mb-4">Which languages do you want to practice in this session?</p>
              
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto p-1 mb-6">
                {userLanguages.map(lang => (
                  <label key={lang} className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-colors ${
                    selectedLanguages.includes(lang) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-100'
                  }`}>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedLanguages.includes(lang)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLanguages(prev => [...prev, lang]);
                        } else {
                          setSelectedLanguages(prev => prev.filter(l => l !== lang));
                        }
                      }}
                    />
                    <span className={`text-base font-medium ${selectedLanguages.includes(lang) ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {lang}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPendingAction(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={selectedLanguages.length === 0}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Start Practice
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showSettings && (
        <SettingsModal 
          userLanguages={userLanguages} 
          setUserLanguages={setUserLanguages} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </motion.div>
  );
}
