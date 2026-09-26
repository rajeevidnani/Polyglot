import { useSyncExternalStore } from 'react';

// The user's own Gemini key. It stays in this browser and is sent only to Google.
const STORAGE_KEY = 'polyglot_gemini_key';
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function getApiKey(): string {
  return read();
}

export function setApiKey(key: string) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode): the key just won't persist.
  }
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useApiKey(): string {
  return useSyncExternalStore(subscribe, read, () => '');
}

export class MissingKeyError extends Error {
  constructor() {
    super('Add your Gemini key in Settings to use AI features.');
    this.name = 'MissingKeyError';
  }
}
