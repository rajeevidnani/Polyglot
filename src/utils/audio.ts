let globalAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return globalAudioCtx;
}

export async function playBase64Audio(base64Data: string) {
  const audioCtx = getAudioContext();
  
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  try {
    // Try decoding as WAV/MP3
    const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (e) {
    // Fallback to raw PCM 24000Hz 16-bit little-endian
    const sampleRate = 24000;
    const numChannels = 1;
    const numSamples = bytes.length / 2;
    const audioBuffer = audioCtx.createBuffer(numChannels, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    const dataView = new DataView(bytes.buffer);
    for (let i = 0; i < numSamples; i++) {
      channelData[i] = dataView.getInt16(i * 2, true) / 32768;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  }
}
