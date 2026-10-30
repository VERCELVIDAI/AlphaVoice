import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  AudioLinesIcon,
  CheckIcon,
  DownloadIcon,
  FingerprintIcon,
  LanguagesIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  SparklesIcon,
  TerminalIcon,
  Wand2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DEMO_VOICES,
  playAudioDemo,
  stopAudioDemo,
  type DemoVoice,
} from '@/features/portal/audio-demo-player';

export function WebsiteFeaturesPage() {
  const [activeTab, setActiveTab] = useState<'clone' | 'design' | 'dub' | 'dictate' | 'audiobook' | 'api'>('clone');
  const [activeVoice, setActiveVoice] = useState<DemoVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handleTogglePlay(voice: DemoVoice) {
    if (activeVoice?.id === voice.id && isPlaying) {
      stopAudioDemo();
      setIsPlaying(false);
      setActiveVoice(null);
    } else {
      setActiveVoice(voice);
      setIsPlaying(true);
      playAudioDemo(voice, undefined, () => {
        setIsPlaying(false);
        setActiveVoice(null);
      });
    }
  }

  const features = [
    {
      id: 'clone' as const,
      name: 'Zero-Shot Voice Cloning',
      badge: '3-Second Audio Sample',
      icon: FingerprintIcon,
      headline: 'Clone Any Voice with Zero Cloud Latency and Full Nuance',
      desc: 'AlphaVoice Studio uses localized neural acoustic representations (including F5-TTS, CosyVoice, and Chatterbox) to match timbre, pacing, accent, room acoustics, and breathiness from a simple short microphone recording or audio file.',
      capabilities: [
        'Zero-shot reference cloning from 3 to 10 seconds of clear speech',
        'Speaker diarization with automated background noise reduction',
        'Cross-lingual cloning: clone an English voice and synthesize fluent Spanish or Japanese',
        'Zero cloud leakage: reference WAV files remain entirely encrypted on local disk',
      ],
      metrics: [
        { label: 'Sample Required', value: '3 Seconds' },
        { label: 'Similarity Score', value: '98.4%' },
        { label: 'Cloud Data Transfer', value: '0 Bytes' },
      ],
      voicePreset: DEMO_VOICES[0],
    },
    {
      id: 'design' as const,
      name: 'Generative Voice Design',
      badge: 'Prompt-Driven Synthesis',
      icon: Wand2Icon,
      headline: 'Synthesize Entirely Original Voice Personas from Natural Language',
      desc: 'Do not have an audio sample? Describe who you want speaking in natural English. Combine traits such as age, gender, accent, raspiness, pitch, and emotional cadence to generate a brand new virtual voice actor.',
      capabilities: [
        'Natural language prompt-to-speech parameter synthesis',
        'Full acoustic sliders: Pitch, Speed, Energy, Breathiness, Emotion',
        'Save generated recipes as reusable Voice Profiles for entire projects',
        'Randomized seed exploration for discovering serendipitous vocal character traits',
      ],
      metrics: [
        { label: 'Prompt Response', value: '< 1.2s' },
        { label: 'Supported Accents', value: '25+' },
        { label: 'Exportable Seed', value: 'Instant' },
      ],
      voicePreset: DEMO_VOICES[1],
    },
    {
      id: 'dub' as const,
      name: 'Multilingual Video Dubbing',
      badge: '20+ Languages',
      icon: LanguagesIcon,
      headline: 'Translate & Dub Entire Video Tracks with Automatic Lip-Sync Cadence',
      desc: 'Import MP4, MOV, or MKV videos. AlphaVoice Studio transcribes the speech, translates dialogue while preserving domain glossaries, and regenerates dubbed audio aligned to the original video timecodes.',
      capabilities: [
        'Automated speech recognition and subtitle alignment',
        'Translates across English, Spanish, French, German, Japanese, Chinese, and 15+ more',
        'Preserves original background music and sound effects (stem separation)',
        'Lip-sync pace compression and pitch preservation',
      ],
      metrics: [
        { label: 'Languages', value: '20+' },
        { label: 'Stem Separation', value: 'Automated' },
        { label: 'Format Support', value: 'MP4 / MKV' },
      ],
      voicePreset: DEMO_VOICES[2],
    },
    {
      id: 'dictate' as const,
      name: 'WhisperX GPU Dictation',
      badge: 'Real-Time Speech-to-Text',
      icon: MicIcon,
      headline: 'Sub-Second Local Speech Recognition with Word-Level Phoneme Timestamps',
      desc: 'Powered by WhisperX running directly on your local GPU (DirectML on Windows, Metal on Apple Silicon, CUDA on Linux). Transcribe interviews, meetings, and stream commentary with pinpoint accuracy.',
      capabilities: [
        'Phoneme-level word alignment with millisecond timestamps',
        'Real-time low-latency streaming dictation mode',
        'VAD (Voice Activity Detection) filter out coughs, silence, and typing',
        'Direct export to SRT, VTT, JSON, and plain text transcripts',
      ],
      metrics: [
        { label: 'Latency', value: '< 250ms' },
        { label: 'Word Error Rate', value: 'Sub-3%' },
        { label: 'VAD Processing', value: 'Hardware' },
      ],
      voicePreset: DEMO_VOICES[3],
    },
    {
      id: 'audiobook' as const,
      name: 'Audiobook & Story Studio',
      badge: 'Multi-Speaker Orchestration',
      icon: AudioLinesIcon,
      headline: 'Full-Length Chapter Production with Assigned Character Casts',
      desc: 'Produce complete audiobooks and multi-character audio plays. Parse scripts into dialogue lines, assign different cloned or designed voices to each character, and export master broadcast-ready MP3/FLAC chapters.',
      capabilities: [
        'Multi-speaker character casting from saved profile library',
        'Chapter and scene timeline editor with pause and silence pacing controls',
        'Batch rendering with background CPU/GPU multi-worker queues',
        'Integrated pronunciation dictionary for difficult character names and fantasy terms',
      ],
      metrics: [
        { label: 'Max Chapter Length', value: 'Unlimited' },
        { label: 'Speakers per Scene', value: '50+' },
        { label: 'Batch Throughput', value: '15x Speed' },
      ],
      voicePreset: DEMO_VOICES[0],
    },
    {
      id: 'api' as const,
      name: 'Local API & MCP Server',
      badge: 'OpenAI-Compatible & Anthropic MCP',
      icon: TerminalIcon,
      headline: 'Connect Your Local AI Agents and Applications Directly to Local Speech',
      desc: 'Every AlphaVoice Studio instance runs an OpenAI-compatible REST server (`/v1/audio/speech`, `/v1/audio/transcriptions`) and Model Context Protocol (MCP) server for integration with Cursor, Claude Code, and agentic pipelines.',
      capabilities: [
        'Drop-in replacement for OpenAI TTS API endpoint (`http://localhost:3900/v1`)',
        'Anthropic Model Context Protocol (MCP) tool bindings for AI agents',
        'Python and TypeScript SDK compatibility',
        'Offline zero-telemetry socket and websocket streaming',
      ],
      metrics: [
        { label: 'Protocol', value: 'OpenAI + MCP' },
        { label: 'Port', value: ':3900' },
        { label: 'API Key', value: 'Configurable' },
      ],
      voicePreset: DEMO_VOICES[3],
    },
  ];

  const currentFeature = features.find((f) => f.id === activeTab) || features[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <SparklesIcon className="size-3.5" />
          <span>Next-Generation Architecture</span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Complete Voice AI Feature Suite
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed">
          Explore every dimension of AlphaVoice Studio. All features run 100% locally on your machine
          with zero cloud dependency, unlimited character generations, and broadcast fidelity.
        </p>
      </div>

      {/* Feature Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border/60 pb-4">
        {features.map((f) => {
          const Icon = f.icon;
          const isActive = activeTab === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveTab(f.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-card/70 border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{f.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Feature Detail Showcase Card */}
      <div className="website-card rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Description & Capabilities */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-md bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
              {currentFeature.badge}
            </div>

            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              {currentFeature.headline}
            </h2>

            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {currentFeature.desc}
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Key Technical Capabilities
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {currentFeature.capabilities.map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckIcon className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
              {currentFeature.metrics.map((m, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 bg-card/60 p-3 text-center">
                  <div className="text-sm font-bold text-foreground sm:text-base">{m.value}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground uppercase">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Test Bench */}
          <div className="space-y-6 rounded-2xl border border-border/70 bg-black/40 p-6 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Live Acoustic Preview
              </span>
              <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Real-Time
              </span>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/70 p-4">
              <div className="text-xs font-bold text-foreground">{currentFeature.voicePreset.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {currentFeature.voicePreset.description}
              </div>
              <div className="mt-3 rounded border border-border/40 bg-muted/30 p-2.5 text-[11px] italic text-muted-foreground">
                "{currentFeature.voicePreset.script}"
              </div>
            </div>

            <Button
              onClick={() => handleTogglePlay(currentFeature.voicePreset)}
              className="h-10 w-full gap-2 text-xs font-semibold"
            >
              {activeVoice?.id === currentFeature.voicePreset.id && isPlaying ? (
                <>
                  <PauseIcon className="size-4" />
                  Stop Playback
                </>
              ) : (
                <>
                  <PlayIcon className="size-4 fill-current" />
                  Test Synthesize This Voice
                </>
              )}
            </Button>

            <div className="pt-2">
              <Link
                to="/download"
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <DownloadIcon className="size-3.5" />
                Download AlphaVoice to run this feature locally &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Feature Comparison CTA */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-8 text-center">
        <h3 className="text-lg font-bold text-foreground">Ready to test these features on your own machine?</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Download AlphaVoice Studio free. Test zero-shot cloning and dictation offline.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            to="/download"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground"
          >
            Download Free
          </Link>
          <Link
            to="/pricing"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Commercial Licensing
          </Link>
        </div>
      </div>
    </div>
  );
}
