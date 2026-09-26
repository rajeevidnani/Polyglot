import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { WebSocketServer } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { createServer as createHttpServer } from "http";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createHttpServer(app);
  
  // Set up WebSocket server for Live API
  const wss = new WebSocketServer({ server: httpServer, path: '/live' });

  wss.on("connection", async (clientWs) => {
    // The client will send an initial message with the selected language
    let session: any = null;

    clientWs.on("message", async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        
        if (msg.type === "start") {
          // Initialize session with the target language
          const targetLanguage = msg.language || "Spanish";
          
          session = await ai.live.connect({
            model: "gemini-3.1-flash-live-preview",
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
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
                if (audio && clientWs.readyState === 1) {
                  clientWs.send(JSON.stringify({ audio }));
                }
                if (message.serverContent?.interrupted && clientWs.readyState === 1) {
                  clientWs.send(JSON.stringify({ interrupted: true }));
                }
              },
              onclose: () => {
                if (clientWs.readyState === 1) {
                  clientWs.close();
                }
              },
              onerror: (e) => {
                console.error("Live API Error:", e);
                if (clientWs.readyState === 1) {
                  clientWs.send(JSON.stringify({ error: "Live API Error" }));
                }
              }
            },
          });
        } else if (msg.audio && session) {
          session.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
          });
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });

    clientWs.on("close", () => {
      // End session if needed (the SDK handles cleanup generally)
    });
  });

  app.use(express.json());

  // API Routes
  app.post("/api/generatePhrasePractice", async (req, res) => {
    try {
      const { phrase, targetLanguages } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
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
                      nativeSentence: { type: Type.STRING }
                    },
                    required: ["language", "word", "sentence"]
                  }
                }
              },
              required: ["id", "english", "englishSentence", "translationsList"]
            }
          }
        }
      });
    
      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      
      const parsed = JSON.parse(text);
      const formatted = parsed.map((item: any) => {
        const translations: Record<string, any> = {};
        if (item.translationsList) {
          item.translationsList.forEach((t: any) => {
            translations[t.language] = {
              word: t.word,
              sentence: t.sentence,
              nativeWord: t.nativeWord,
              nativeSentence: t.nativeSentence
            };
          });
        }
        return {
          id: item.id,
          english: item.english,
          englishSentence: item.englishSentence,
          translations
        };
      });
      
      res.json(formatted);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/generateSpeech", async (req, res) => {
    try {
      const { text, lang } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: `Say in ${lang}: ${text}`,
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
    
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("Failed to generate audio");
      }
      res.json({ audio: base64Audio });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
