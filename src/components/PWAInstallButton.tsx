import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-100 px-4 py-3 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-200 transition-colors w-full"
      >
        <Download className="w-5 h-5" />
        Install App
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-100 px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors w-full"
        >
          <Download className="w-5 h-5" />
          Install on iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl relative">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Install Polyglot</h3>
              <p className="text-slate-600 text-center mb-6">
                Add this app to your home screen for a seamless, full-screen experience.
              </p>
              
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl text-slate-700 font-medium text-sm">
                <p className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm text-xs font-bold">1</span>
                  Tap the <Share className="w-4 h-4 mx-1 text-indigo-600" /> Share button in the Safari toolbar.
                </p>
                <p className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm text-xs font-bold">2</span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
              
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
