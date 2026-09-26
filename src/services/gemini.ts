import { WordData } from "../types";

export async function generatePhrasePractice(phrase: string, targetLanguages: string): Promise<WordData[]> {
  const res = await fetch("/api/generatePhrasePractice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phrase, targetLanguages }),
  });
  if (!res.ok) {
    throw new Error("Failed to generate practice phrases");
  }
  return res.json();
}

export async function generateSpeech(text: string, lang: string): Promise<string> {
  const res = await fetch("/api/generateSpeech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });
  if (!res.ok) {
    throw new Error("Failed to generate speech");
  }
  const data = await res.json();
  return data.audio;
}
