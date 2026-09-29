// Languages with built-in lessons. Other languages still work for custom phrases.
export const COURSE_LANGUAGES = ['Dutch', 'Spanish', 'Hindi', 'Sindhi', 'Gujarati'] as const;
export type CourseLanguage = (typeof COURSE_LANGUAGES)[number];

export const isCourseLanguage = (lang: string): lang is CourseLanguage =>
  (COURSE_LANGUAGES as readonly string[]).includes(lang);

// r: romanised (or the word itself for Latin-script languages)
// n: native script (Devanagari for Hindi, Gujarati script, Perso-Arabic for Sindhi)
// d: Sindhi in Devanagari
export interface Rendering {
  r: string;
  n?: string;
  d?: string;
}

export interface CoreSentence {
  id: string;
  english: string;
  source: 'ferriss' | 'extra';
  teaches: string;
  tr: Record<CourseLanguage, Rendering & { note: string }>;
}

export interface CommonWord {
  id: string;
  english: string;
  theme: string;
  tr: Record<CourseLanguage, Rendering>;
}
