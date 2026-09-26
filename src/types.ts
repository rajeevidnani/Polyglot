export type Language = string;

export interface Translation {
  word: string;
  sentence: string;
  nativeWord?: string;
  nativeSentence?: string;
}

export interface WordData {
  id: string;
  english: string;
  englishSentence: string;
  translations: Record<string, Translation>;
}
