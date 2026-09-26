let globalAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return globalAudioCtx;
}

function base64ToBytes(base64Data: string): Uint8Array {
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Gemini TTS and Live return raw 16-bit little-endian mono PCM at 24 kHz,
// which decodeAudioData can't read, so build the buffer by hand.
export function pcmToAudioBuffer(audioCtx: AudioContext, base64Data: string, sampleRate = 24000): AudioBuffer {
  const bytes = base64ToBytes(base64Data);
  const numSamples = Math.floor(bytes.length / 2);
  const audioBuffer = audioCtx.createBuffer(1, numSamples, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  const dataView = new DataView(bytes.buffer);
  for (let i = 0; i < numSamples; i++) {
    channelData[i] = dataView.getInt16(i * 2, true) / 32768;
  }
  return audioBuffer;
}

export async function playBase64Audio(base64Data: string) {
  const audioCtx = getAudioContext();
  let audioBuffer: AudioBuffer;
  try {
    // In case a model returns a container format (WAV/MP3)
    audioBuffer = await audioCtx.decodeAudioData(base64ToBytes(base64Data).buffer.slice(0) as ArrayBuffer);
  } catch {
    audioBuffer = pcmToAudioBuffer(audioCtx, base64Data);
  }
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
}
