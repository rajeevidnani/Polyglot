# Polyglot

A calm language-practice app for multilingual families. I built it to practise the languages spoken in my family (Dutch, Spanish, Hindi, Sindhi and Gujarati) without the points, hearts and leagues of the big apps. Just practice, and seeing yourself get better.

**Try it:** https://polyglot-practice-903820173188.us-west1.run.app/ (installable on your phone via "Add to Home Screen")

## What it does

- **Core sentences (Tim Ferriss's method).** Start with the handful of sentences from Ferriss's [deconstruction method](https://tim.blog/2007/11/07/how-to-learn-but-not-master-any-language-in-1-hour-plus-a-favor/) ("The apple is red", "I give John the apple", "I must give it to him"…). They show how a language works: word order, gender, "not", "must" and "want". Each one comes with a note on what it teaches in that language.
- **The most common words, most useful first.** 155 words (basics, pronouns, question words, core verbs, time, family, food, numbers) in Dutch, Spanish, Hindi, Sindhi and Gujarati, practised 10 at a time.
- **Progress without games.** Spaced repetition brings back the words and sentences you get wrong sooner and the ones you know later. You see what you've learned and which days you practised. No points, hearts or streak pressure. Progress stays on your device, with a backup download.
- **Native script and romanised side by side.** Sindhi can be shown in Perso-Arabic, Devanagari or both.
- **Practise any phrase.** Type or say something you actually want to say ("Yes, I learned Dutch in elementary school"). Gemini gives you a beginner version and the full version in each of your languages.
- **Listen** to any word or sentence spoken aloud.
- **Live voice coach.** Have a spoken conversation with Gemini. It helps when you mix in English and gently corrects your grammar.
- **Your languages.** Add or remove any language in Settings.

## Bring your own key

The AI features use **your own free Gemini API key**:

1. Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). It takes about a minute.
2. In the app, open **Settings** (the gear icon) and paste it in. It's tested before it's saved.

The key is stored only in your browser, and the app sends it only to Google. The Polyglot server never sees it. Without a key, all the lessons and your progress still work. Only listening, custom phrases and the voice coach need it.

> Translations were drafted with AI help. Sindhi and Gujarati in particular should be checked by a native speaker, and corrections are welcome.

## Roadmap

1. ✅ **Solid foundations:** own-key AI, stable Gemini models, no server secrets
2. **Daily use:** ✅ core sentences, ✅ common words, ✅ progress with spaced repetition. Next: your own word lists and an English-to-script alphabet guide
3. **Speaking:** scenario-based coaching and pronunciation feedback
4. **Family:** profiles, shared phrase packs, sync across devices

## Run it locally

Needs Node 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

For production: `npm run build && npm start`.

## Tech

React 19, TypeScript, Vite, Tailwind CSS, and the Google Gen AI SDK (`@google/genai`) called from the browser. It's an installable PWA. A small Express server serves the built app on Google Cloud Run. Model names live in [`src/config/models.ts`](src/config/models.ts).

Started in Google AI Studio as my capstone for the Google AI Professional Certificate, then moved to this repo and developed with Claude Code.
