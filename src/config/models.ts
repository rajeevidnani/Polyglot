// All Gemini model names live here so they're easy to update when Google retires one.
// Stable models as of 2026-09-26: https://ai.google.dev/gemini-api/docs/models
export const MODELS = {
  text: 'gemini-3.8-flash',
  // Used when the main text model is overloaded (503) or rate-limited (429).
  textFallback: 'gemini-3.6-flash',
  speech: 'gemini-3.8-flash-lite-tts',
  live: 'gemini-3.8-live',
} as const;

export const VOICES = {
  speech: 'Kore',
  live: 'Zephyr',
} as const;
