import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  userLanguages: string[];
  setUserLanguages: (langs: string[]) => void;
  onClose: () => void;
}

export function SettingsModal({ userLanguages, setUserLanguages, onClose }: SettingsModalProps) {
  const [newLang, setNewLang] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
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
          <h3 className="font-bold text-slate-800">Language Profile</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
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
