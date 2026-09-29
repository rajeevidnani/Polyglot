import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, KeyRound, Loader2, Check, ExternalLink } from 'lucide-react';
import { useApiKey, setApiKey } from '../lib/apiKey';
import { testApiKey } from '../services/gemini';

interface SettingsModalProps {
  userLanguages: string[];
  setUserLanguages: (langs: string[]) => void;
  onClose: () => void;
}

// Show Google's own reason so a failing key can actually be diagnosed.
function describeKeyError(err: any): string {
  const raw = String(err?.message ?? err ?? '');
  let reason = raw;
  try {
    const parsed = JSON.parse(raw.slice(raw.indexOf('{')));
    reason = parsed?.error?.message ?? raw;
  } catch {
    // Not JSON: keep the raw message.
  }
  return `That key didn't work. Google said: ${reason.slice(0, 300)}`;
}

export function SettingsModal({ userLanguages, setUserLanguages, onClose }: SettingsModalProps) {
  const [newLang, setNewLang] = useState('');
  const savedKey = useApiKey();
  const [keyInput, setKeyInput] = useState(savedKey);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [keyError, setKeyError] = useState('');

  const handleSaveKey = async (e?: FormEvent) => {
    e?.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    setKeyStatus('testing');
    setKeyError('');
    try {
      await testApiKey(key);
      setApiKey(key);
      setKeyStatus('ok');
    } catch (err: any) {
      console.error(err);
      setKeyStatus('error');
      setKeyError(describeKeyError(err));
    }
  };

  const handleRemoveKey = () => {
    setApiKey('');
    setKeyInput('');
    setKeyStatus('idle');
  };

  const handleAdd = (e?: FormEvent) => {
    e?.preventDefault();
    const lang = newLang.trim();
    if (lang && !userLanguages.includes(lang)) {
      setUserLanguages([...userLanguages, lang]);
      setNewLang('');
    }
  };

  const handleRemove = (lang: string) => {
    setUserLanguages(userLanguages.filter(l => l !== lang));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800">Settings</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <section className="mb-8">
            <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              Your Gemini key
            </h4>
            <p className="text-sm text-slate-500 mb-3">
              AI features (custom phrases, listening, the voice coach) use your own free Gemini key. It stays in this browser and is only sent to Google.
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-3"
            >
              Get a free key <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <form onSubmit={handleSaveKey} className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setKeyStatus('idle'); }}
                placeholder="Paste your key"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="submit"
                disabled={!keyInput.trim() || keyStatus === 'testing'}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {keyStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </form>
            {keyStatus === 'ok' && (
              <p className="flex items-center gap-1 text-sm text-emerald-600 mt-2"><Check className="w-4 h-4" /> Key works and is saved.</p>
            )}
            {keyStatus === 'error' && <p className="text-sm text-rose-500 mt-2">{keyError}</p>}
            {savedKey && keyStatus !== 'ok' && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-slate-500">A key is saved on this device.</p>
                <button onClick={handleRemoveKey} className="text-sm text-rose-500 hover:text-rose-700">Remove</button>
              </div>
            )}
          </section>

          <h4 className="font-semibold text-slate-800 mb-1">Languages</h4>
          <p className="text-sm text-slate-500 mb-4">Add or remove languages you want to practice. These will appear as options throughout the app.</p>
          
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              placeholder="e.g. Japanese, French..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="submit"
              disabled={!newLang.trim()}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-2">
            {userLanguages.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No languages added yet.</p>
            ) : (
              userLanguages.map(lang => (
                <div key={lang} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <span className="font-medium text-slate-700">{lang}</span>
                  <button
                    onClick={() => handleRemove(lang)}
                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
