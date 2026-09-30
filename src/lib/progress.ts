import { useSyncExternalStore } from 'react';

// Progress is stored on this device only. Spaced repetition uses simple
// "boxes": each right answer moves an item up a box and pushes its next
// review further out; a wrong answer sends it back to box 0.
export type ItemKind = 'word' | 'sentence';

export interface ItemProgress {
  box: number;
  due: number; // epoch ms
  seen: number;
  correct: number;
}

interface ProgressState {
  version: 1;
  items: Record<string, ItemProgress>; // key: lang|kind|id
  days: Record<string, string[]>; // lang -> ISO dates practised
}

const STORAGE_KEY = 'polyglot_progress_v1';
const DAY = 24 * 60 * 60 * 1000;
const INTERVAL_DAYS = [0, 1, 3, 7, 16, 35];
export const LEARNED_BOX = 3;

const empty = (): ProgressState => ({ version: 1, items: {}, days: {} });

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return parsed?.version === 1 ? parsed : empty();
  } catch {
    return empty();
  }
}

let state = load();
const listeners = new Set<() => void>();

function save(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: progress lasts for this visit only.
  }
  listeners.forEach(l => l());
}

const keyOf = (lang: string, kind: ItemKind, id: string) => `${lang}|${kind}|${id}`;
const today = () => new Date().toISOString().slice(0, 10);

export function recordAnswer(lang: string, kind: ItemKind, id: string, correct: boolean) {
  const key = keyOf(lang, kind, id);
  const prev = state.items[key] ?? { box: 0, due: 0, seen: 0, correct: 0 };
  const box = correct ? Math.min(prev.box + 1, INTERVAL_DAYS.length - 1) : 0;
  const item: ItemProgress = {
    box,
    due: Date.now() + INTERVAL_DAYS[box] * DAY,
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
  };
  const langDays = state.days[lang] ?? [];
  const days = langDays.includes(today()) ? langDays : [...langDays, today()];
  save({ ...state, items: { ...state.items, [key]: item }, days: { ...state.days, [lang]: days } });
}

export function getItem(lang: string, kind: ItemKind, id: string): ItemProgress | undefined {
  return state.items[keyOf(lang, kind, id)];
}

export interface Summary {
  learned: number;
  learning: number;
  due: number;
  fresh: number;
}

export function summarize(lang: string, kind: ItemKind, ids: string[]): Summary {
  const now = Date.now();
  const s: Summary = { learned: 0, learning: 0, due: 0, fresh: 0 };
  ids.forEach(id => {
    const p = state.items[keyOf(lang, kind, id)];
    if (!p) return void s.fresh++;
    if (p.box >= LEARNED_BOX) s.learned++;
    else s.learning++;
    if (p.due <= now) s.due++;
  });
  return s;
}

// Due reviews first (weakest first), then new items in the order given.
export function buildSession(lang: string, kind: ItemKind, orderedIds: string[], size: number): string[] {
  const now = Date.now();
  const due = orderedIds
    .filter(id => {
      const p = state.items[keyOf(lang, kind, id)];
      return p && p.due <= now;
    })
    .sort((a, b) => state.items[keyOf(lang, kind, a)].box - state.items[keyOf(lang, kind, b)].box);
  const fresh = orderedIds.filter(id => !state.items[keyOf(lang, kind, id)]);
  return [...due, ...fresh].slice(0, size);
}

// Same idea across several languages at once: a word is due if it's due in any of them.
export function buildMultiSession(langs: string[], kind: ItemKind, orderedIds: string[], size: number): string[] {
  const now = Date.now();
  const weakest = (id: string) => Math.min(...langs.map(l => state.items[keyOf(l, kind, id)]?.box ?? 0));
  const due = orderedIds
    .filter(id => langs.some(l => {
      const p = state.items[keyOf(l, kind, id)];
      return p && p.due <= now;
    }))
    .sort((a, b) => weakest(a) - weakest(b));
  const fresh = orderedIds.filter(id => !due.includes(id) && langs.some(l => !state.items[keyOf(l, kind, id)]));
  return [...due, ...fresh].slice(0, size);
}

export function practisedDays(lang: string): string[] {
  return state.days[lang] ?? [];
}

export function exportProgress(): string {
  return JSON.stringify(state, null, 2);
}

export function importProgress(json: string) {
  const parsed = JSON.parse(json);
  if (parsed?.version !== 1 || typeof parsed.items !== 'object') {
    throw new Error("That file isn't a Polyglot progress backup.");
  }
  save({ version: 1, items: parsed.items ?? {}, days: parsed.days ?? {} });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Re-renders the caller whenever progress changes.
export function useProgressVersion(): ProgressState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
