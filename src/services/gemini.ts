import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { LiveServerMessage, Session } from "@google/genai";
import { WordData } from "../types";
import { MODELS, VOICES } from "../config/models";
import { getApiKey, MissingKeyError } from "../lib/apiKey";

// Gemini is called straight from the browser with the user's own key,
// so the Polyglot server never sees or spends anyone's quota.
function client(key = getApiKey()): GoogleGenAI {
  if (!key) throw new MissingKeyError();
  return new GoogleGenAI({ apiKey: key });
}

// Checks the key without generating anything, so a busy model can't make a good key look bad.
export async function testApiKey(key: string): Promise<void> {
  await client(key).models.get({ model: MODELS.text });
}

export function isBusy(err: any): boolean {
  const status = err?.status ?? err?.code;
  return status === 503 || status === 429 || /high demand|overloaded|UNAVAILABLE|RESOURCE_EXHAUSTED/i.test(String(err?.message));
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retries briefly when Gemini is busy, then moves to the next model in the list.
async function withBusyRetry<T>(models: string[], call: (model: string) => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await call(model);
      } catch (err) {
        lastErr = err;
        if (!isBusy(err)) throw err;
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  throw lastErr;
}

export async function generatePhrasePractice(phrase: string, targetLanguages: string): Promise<WordData[]> {
  const ai = client();
  const response = await withBusyRetry([MODELS.text, MODELS.textFallback], model => ai.models.generateContent({
    model,
    contents: `The user wants to practice a specific conversational phrase or flow in multiple languages.
    User phrase: "${phrase}".
    Target Languages: ${targetLanguages}

    First, simplify this phrase into a basic, shorter version that conveys the same core meaning (e.g. for beginners).
    Then, return a JSON array with exactly two items:
    1. The first item represents the Basic Version of the phrase.
    2. The second item represents the exact Complex Phrase provided by the user (or slightly polished if grammatically necessary).

    For each item:
    - Set 'id' to a unique string.
    - Set 'english' to either "Basic Version" (for item 1) or "Complex Version" (for item 2).
    - Set 'englishSentence' to the actual phrase in English.
    - Provide an array of 'translationsList' covering EACH of the target languages requested.
    - For languages with non-Latin scripts, provide BOTH the English alphabet pronunciation (Romanized) in 'word' and 'sentence', AND the actual native script spelling in 'nativeWord' and 'nativeSentence'.

    Provide the output as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            english: { type: Type.STRING },
            englishSentence: { type: Type.STRING },
            translationsList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  language: { type: Type.STRING },
                  word: { type: Type.STRING },
                  sentence: { type: Type.STRING },
                  nativeWord: { type: Type.STRING },
                  nativeSentence: { type: Type.STRING },
                },
                required: ["language", "word", "sentence"],
              },
            },
          },
          required: ["id", "english", "englishSentence", "translationsList"],
        },
      },
    },
  }));

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text).map((item: any) => {
    const translations: WordData["translations"] = {};
    item.translationsList?.forEach((t: any) => {
      translations[t.language] = {
        word: t.word,
        sentence: t.sentence,
        nativeWord: t.nativeWord,
        nativeSentence: t.nativeSentence,
      };
    });
    return {
      id: item.id,
      english: item.english,
      englishSentence: item.englishSentence,
      translations,
    };
  });
}

export async function generateSpeech(text: string, lang: string): Promise<string> {
  const ai = client();
  const response = await withBusyRetry([MODELS.speech], model => ai.models.generateContent({
    model,
    contents: `Say in ${lang}: ${text}`,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICES.speech } },
      },
    },
  }));

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Failed to generate audio");
  return base64Audio;
}

export interface LiveCallbacks {
  onAudio: (base64Pcm: string) => void;
  onInterrupted: () => void;
  onClose: () => void;
  onError: (message: string) => void;
}

export function connectLiveCoach(targetLanguage: string, callbacks: LiveCallbacks): Promise<Session> {
  return client().live.connect({
    model: MODELS.live,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICES.live } },
      },
      systemInstruction: `You are an intelligent language coach helping the user learn ${targetLanguage}.
      Rules:
      1. If the user speaks half in ${targetLanguage} and half in English, gently help them understand the words they missed or said in English.
      2. Correct poor conjugation or grammar in a supportive, constructive way.
      3. Keep the conversation flowing and encourage them to try again.
      4. Always be encouraging and friendly.`,
    },
    callbacks: {
      onmessage: (message: LiveServerMessage) => {
        const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audio) callbacks.onAudio(audio);
        if (message.serverContent?.interrupted) callbacks.onInterrupted();
      },
      onclose: () => callbacks.onClose(),
      onerror: (e: ErrorEvent) => {
        console.error("Live API error:", e);
        callbacks.onError("The live coach hit an error. Check your key and try again.");
      },
    },
  });
}
