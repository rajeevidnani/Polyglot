import { useSyncExternalStore } from 'react';

// Sindhi is written in Perso-Arabic script (Pakistan) and Devanagari (India).
export type SindhiScript = 'arabic' | 'devanagari' | 'both';

const STORAGE_KEY = 'polyglot_sindhi_script';
const listeners = new Set<() => void>();

function read(): SindhiScript {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'arabic' || v === 'devanagari' || v === 'both' ? v : 'both';
  } catch {
    return 'both';
  }
}

export function setSindhiScript(v: SindhiScript) {
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // ignore
  }
  listeners.forEach(l => l());
}

export function useSindhiScript(): SindhiScript {
  return useSyncExternalStore(
    l => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => 'both' as SindhiScript,
  );
}
