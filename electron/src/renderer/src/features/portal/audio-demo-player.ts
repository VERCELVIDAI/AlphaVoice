/**
 * Lightweight in-browser Web Audio harmonic acoustic synthesizer
 * Generates realistic vocal formants, pitch curves, and speech cadences
 * for live interactive playback in the AlphaVoice Studio portal.
 */

let sharedAudioCtx: AudioContext | null = null;
let currentOscillators: OscillatorNode[] = [];
let currentGainNode: GainNode | null = null;
let currentAnimFrame: number | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    void sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

export interface DemoVoice {
  id: string;
  name: string;
  tag: string;
  description: string;
  pitch: number; // Fundamental frequency in Hz
  harmonics: number[];
  vowelFormants: [number, number]; // [F1, F2]
  script: string;
}

export const DEMO_VOICES: DemoVoice[] = [
  {
    id: 'clone-podcast',
    name: 'Neural Clone (Host Alpha)',
    tag: 'Zero-Shot Clone',
    description: 'Crisp, articulate narrative delivery cloned from a 3-second microphone sample.',
    pitch: 130, // Warm baritone
    harmonics: [1.0, 0.7, 0.45, 0.3, 0.15],
    vowelFormants: [500, 1500],
    script: 'Welcome to AlphaVoice Studio. Every model runs 100% locally on your machine with studio fidelity.',
  },
  {
    id: 'design-cinematic',
    name: 'Cinematic Narrator (Trailer)',
    tag: 'Voice Design',
    description: 'Deep, resonant, dramatic vocal timbre crafted purely through text prompts.',
    pitch: 88, // Deep bass
    harmonics: [1.2, 0.85, 0.6, 0.4, 0.25],
    vowelFormants: [350, 1100],
    script: 'In a world where privacy matters, sovereign voice intelligence is finally in your hands.',
  },
  {
    id: 'dub-multilingual',
    name: 'Global Translator (Multilingual)',
    tag: 'Neural Dubbing',
    description: 'Sub-second translation and lip-sync cadence preserving the original speaker acoustic timbre.',
    pitch: 175, // Tenor / expressive
    harmonics: [0.9, 0.65, 0.5, 0.3, 0.18],
    vowelFormants: [600, 1800],
    script: 'Translate across 20+ languages while preserving exact vocal characteristics and emotional warmth.',
  },
  {
    id: 'dictate-fast',
    name: 'WhisperX Direct Dictation',
    tag: 'Speech-to-Text',
    description: 'Real-time on-device GPU speech recognition with sub-second latency and word timestamps.',
    pitch: 210, // Higher conversational
    harmonics: [0.8, 0.55, 0.4, 0.25, 0.12],
    vowelFormants: [700, 2100],
    script: 'Direct hardware transcription with zero data leaving your GPU. Fast, private, uncompromising.',
  },
];

export function stopAudioDemo(): void {
  if (currentGainNode && sharedAudioCtx) {
    try {
      currentGainNode.gain.setValueAtTime(currentGainNode.gain.value, sharedAudioCtx.currentTime);
      currentGainNode.gain.linearRampToValueAtTime(0, sharedAudioCtx.currentTime + 0.08);
    } catch {
      // Ignore ramp error on quick stop
    }
  }
  setTimeout(() => {
    for (const osc of currentOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    }
    currentOscillators = [];
    currentGainNode = null;
  }, 100);

  if (currentAnimFrame) {
    cancelAnimationFrame(currentAnimFrame);
    currentAnimFrame = null;
  }
}

export function playAudioDemo(
  voice: DemoVoice,
  onProgress?: (progress: number) => void,
  onFinish?: () => void,
): void {
  stopAudioDemo();

  // If SpeechSynthesis is supported, also trigger spoken utterance for realistic audio!
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(voice.script);
    utterance.rate = 1.0;
    utterance.pitch = voice.pitch > 150 ? 1.1 : voice.pitch < 100 ? 0.75 : 0.95;
    utterance.onend = () => {
      stopAudioDemo();
      onFinish?.();
    };
    window.speechSynthesis.speak(utterance);
  }

  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.05);

  const filter1 = ctx.createBiquadFilter();
  filter1.type = 'bandpass';
  filter1.frequency.setValueAtTime(voice.vowelFormants[0], ctx.currentTime);
  filter1.Q.setValueAtTime(3.5, ctx.currentTime);

  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'bandpass';
  filter2.frequency.setValueAtTime(voice.vowelFormants[1], ctx.currentTime);
  filter2.Q.setValueAtTime(4.0, ctx.currentTime);

  const oscs: OscillatorNode[] = [];

  voice.harmonics.forEach((gainLevel, index) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const harmonicFreq = voice.pitch * (index + 1);

    osc.type = index === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(harmonicFreq, ctx.currentTime);

    // Add mild natural vocal vibrato / pitch fluctuation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(4.8 + index * 0.4, ctx.currentTime);
    lfoGain.gain.setValueAtTime(2.5, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    oscGain.gain.setValueAtTime(gainLevel * 0.18, ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(filter1);
    oscGain.connect(filter2);
    osc.start();
    oscs.push(osc);
  });

  filter1.connect(masterGain);
  filter2.connect(masterGain);
  masterGain.connect(ctx.destination);

  currentOscillators = oscs;
  currentGainNode = masterGain;

  // Track progress over ~4.5 seconds
  const startTime = Date.now();
  const duration = 4800;

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    onProgress?.(progress);

    if (progress < 1) {
      currentAnimFrame = requestAnimationFrame(update);
    } else {
      stopAudioDemo();
      onFinish?.();
    }
  }
  currentAnimFrame = requestAnimationFrame(update);
}
