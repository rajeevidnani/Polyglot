// All Gemini model names live here so they're easy to update when Google retires one.
// Stable models as of 2026-09-26: https://ai.google.dev/gemini-api/docs/models
export const MODELS = {
  text: 'gemini-3.8-flash',
  speech: 'gemini-3.8-flash-lite-tts',
  live: 'gemini-3.8-live',
} as const;

export const VOICES = {
  speech: 'Kore',
  live: 'Zephyr',
} as const;
