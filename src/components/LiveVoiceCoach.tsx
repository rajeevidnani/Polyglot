import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2, Headphones } from 'lucide-react';

interface LiveVoiceCoachProps {
  AVAILABLE_LANGUAGES: string[];
}

export function LiveVoiceCoach({ AVAILABLE_LANGUAGES }: LiveVoiceCoachProps) {
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(AVAILABLE_LANGUAGES[0] || 'Spanish');

  useEffect(() => {
    if (!AVAILABLE_LANGUAGES.includes(language) && AVAILABLE_LANGUAGES.length > 0) {
      setLanguage(AVAILABLE_LANGUAGES[0]);
    }
  }, [AVAILABLE_LANGUAGES]);

  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  // Helper to convert PCM to Base64
  const pcmToBase64 = (pcmData: Float32Array) => {
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < pcmData.length; i++) {
      let s = Math.max(-1, Math.min(1, pcmData[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playAudioChunk = (base64Audio: string) => {
    if (!outputAudioCtxRef.current) return;
    setIsSpeaking(true);
    
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const buffer = bytes.buffer;

    outputAudioCtxRef.current.decodeAudioData(buffer, (audioBuffer) => {
      if (!outputAudioCtxRef.current) return;
      const source = outputAudioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioCtxRef.current.destination);
      
      const currentTime = outputAudioCtxRef.current.currentTime;
      const playTime = Math.max(currentTime, nextPlayTimeRef.current);
      source.start(playTime);
      nextPlayTimeRef.current = playTime + audioBuffer.duration;
      
      source.onended = () => {
        if (outputAudioCtxRef.current && outputAudioCtxRef.current.currentTime >= nextPlayTimeRef.current) {
          setIsSpeaking(false);
        }
      };
    }).catch(err => console.error("Error decoding audio data", err));
  };

  const startSession = async () => {
    setError(null);
    setIsActive(true);
    try {
      // Input: 16kHz for mic capture
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      
      // Output: 24kHz for model output playback
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputCtx;
      nextPlayTimeRef.current = outputCtx.currentTime;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({ type: 'start', language }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio) {
          playAudioChunk(msg.audio);
        }
        if (msg.interrupted) {
          if (outputAudioCtxRef.current) {
            outputAudioCtxRef.current.close();
            const newOutputCtx = new AudioContext({ sampleRate: 24000 });
            outputAudioCtxRef.current = newOutputCtx;
            nextPlayTimeRef.current = newOutputCtx.currentTime;
          }
          setIsSpeaking(false);
        }
        if (msg.error) {
          setError(msg.error);
          stopSession();
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error", e);
        setError("Connection error. Could not reach Live AI.");
        stopSession();
      };

      ws.onclose = () => {
        stopSession();
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = inputCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start microphone or connect to AI");
      stopSession();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnected(false);
    setIsSpeaking(false);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="bg-fuchsia-50 p-5 rounded-2xl border border-fuchsia-100 shadow-sm flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Headphones className="w-24 h-24 text-fuchsia-600" />
      </div>
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-2 bg-fuchsia-100 rounded-lg text-fuchsia-600">
          <Headphones className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-fuchsia-900">AI Language Coach</h3>
          <p className="text-xs text-fuchsia-600/70">Practice speaking live with real-time feedback</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-10 flex-1 justify-end mt-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-fuchsia-900 uppercase tracking-wider">Target Language</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isActive}
            className="w-full px-4 py-2 rounded-xl border border-fuchsia-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white text-sm disabled:opacity-50"
          >
            {AVAILABLE_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

        <div className="flex gap-2">
          {!isActive ? (
            <button
              onClick={startSession}
              className="flex-1 py-3 bg-fuchsia-600 text-white rounded-xl font-medium hover:bg-fuchsia-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Mic className="w-4 h-4" />
              Start Conversation
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="flex-1 py-3 bg-rose-100 text-rose-600 rounded-xl font-medium hover:bg-rose-200 transition-colors flex items-center justify-center gap-2"
            >
              <MicOff className="w-4 h-4" />
              End Session
            </button>
          )}
        </div>

        {isActive && (
          <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-xl border border-fuchsia-100 mt-2">
            {!isConnected ? (
              <div className="flex items-center gap-2 text-fuchsia-500 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full \${isSpeaking ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Volume2 className={`w-4 h-4 \${isSpeaking ? 'animate-pulse' : ''}`} />
                  {isSpeaking ? 'Coach Speaking...' : 'Coach Listening...'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
