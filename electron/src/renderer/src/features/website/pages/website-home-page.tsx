import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  AudioLinesIcon,
  CheckIcon,
  ChevronDownIcon,
  CpuIcon,
  DownloadIcon,
  FingerprintIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  SparklesIcon,
  TerminalIcon,
  Volume2Icon,
  Wand2Icon,
  ZapIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DEMO_VOICES,
  playAudioDemo,
  stopAudioDemo,
  type DemoVoice,
} from '@/features/portal/audio-demo-player';
import { HeroInteractiveCanvas } from '../components/hero-interactive-canvas';

export function WebsiteHomePage() {
  const [activeVoice, setActiveVoice] = useState<DemoVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handleHeroMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setHeroTilt({ x: x * 8, y: -y * 8 });
  }

  function handleHeroMouseLeave() {
    setHeroTilt({ x: 0, y: 0 });
  }

  // Audio visualizer animation
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.beginPath();
      ctx.moveTo(0, centerY);

      const amplitude = isPlaying ? 22 : 4;
      const frequency = isPlaying ? 0.05 : 0.02;

      for (let x = 0; x < width; x++) {
        const y =
          centerY +
          Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI) +
          (isPlaying ? (Math.random() - 0.5) * 5 : 0);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = isPlaying ? '#8b5cf6' : '#64748b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      phase += isPlaying ? 0.15 : 0.03;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  function handleTogglePlay(voice: DemoVoice) {
    if (activeVoice?.id === voice.id && isPlaying) {
      stopAudioDemo();
      setIsPlaying(false);
      setActiveVoice(null);
      setPlaybackProgress(0);
    } else {
      setActiveVoice(voice);
      setIsPlaying(true);
      setPlaybackProgress(0);
      playAudioDemo(
        voice,
        (progress) => setPlaybackProgress(progress),
        () => {
          setIsPlaying(false);
          setActiveVoice(null);
          setPlaybackProgress(0);
        },
      );
    }
  }

  const testimonials = [
    {
      quote:
        'AlphaVoice Studio completely replaced our recurring ElevenLabs cloud bills. Being able to run zero-shot voice cloning and dubbing entirely on our local workstation with zero telemetry is a revelation.',
      author: 'David Chen',
      role: 'Lead Audio Producer, Nexus Media',
      avatar: 'D',
    },
    {
      quote:
        'The audio fidelity and speed on Apple Silicon and NVIDIA RTX is mindblowing. We dub 45-minute technical tutorials into 6 languages locally with accurate lip-sync and tone matching.',
      author: 'Sarah Lindqvist',
      role: 'Independent Content Creator',
      avatar: 'S',
    },
    {
      quote:
        'Having a built-in local OpenAI-compatible endpoint and MCP server means our local AI agents can produce speech natively without sending sensitive audio data to external cloud servers.',
      author: 'Marcus Vance',
      role: 'Staff ML Engineer, Automata',
      avatar: 'M',
    },
  ];

  const faqs = [
    {
      q: 'Does AlphaVoice Studio require an internet connection to generate speech?',
      a: 'No. AlphaVoice Studio is 100% local-first. Once installed, all 40+ neural models, voice cloning engines, and WhisperX dictation run directly on your GPU or CPU without uploading audio or sending telemetry to the cloud.',
    },
    {
      q: 'How does AlphaVoice Studio compare to cloud tools like ElevenLabs?',
      a: 'Cloud tools charge expensive monthly subscription credits per character, require internet connectivity, and store your voice assets on external servers. AlphaVoice Studio gives you unlimited neural voice generation on your own hardware with permanent zero-character fees and total voice sovereignty.',
    },
    {
      q: 'What hardware is required to run AlphaVoice Studio?',
      a: 'AlphaVoice runs on Windows, macOS, and Linux. For best performance, an NVIDIA GPU with 6GB+ VRAM or an Apple Silicon Mac (M1/M2/M3/M4) is recommended. Modern multi-core CPUs with 16GB RAM are also fully supported with optimized quantized engines.',
    },
    {
      q: 'Can I monetize content created with AlphaVoice Studio?',
      a: 'Yes! Pro and Lifetime licenses include complete commercial rights for monetization across YouTube, podcasts, audiobooks, commercials, video games, and client projects.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION WITH INTERACTIVE MOUSE EFFECT */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="website-hero-glow relative overflow-hidden pt-24 pb-20 min-h-[540px] flex items-center justify-center"
      >
        {/* Dynamic interactive mouse reactive neural canvas */}
        <HeroInteractiveCanvas />

        <div
          className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 relative z-10 transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `perspective(1000px) rotateY(${heroTilt.x}deg) rotateX(${heroTilt.y}deg)`,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-lg shadow-primary/10 pointer-events-auto">
            <SparklesIcon className="size-3.5 animate-pulse text-cyan-400" />
            <span>The Independent, Local-First AI Voice Platform</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl select-none">
            Sovereign Voice AI <br className="hidden sm:inline" />
            <span className="website-gradient-text drop-shadow-[0_10px_25px_rgba(139,92,246,0.25)]">
              On Your Own Hardware
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            High-fidelity zero-shot voice cloning, prompt-driven voice design, multilingual video
            dubbing, and real-time WhisperX dictation. 100% on-device neural processing with zero cloud
            lock-in.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
            <Link
              to="/download"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:scale-105 hover:opacity-95 active:scale-95"
            >
              <DownloadIcon className="size-4" />
              Download Free (v0.1.0)
            </Link>
            <Link
              to="/features"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border/80 bg-card/60 px-8 text-sm font-semibold text-foreground backdrop-blur-md transition hover:bg-muted hover:scale-105 active:scale-95"
            >
              Explore Features
              <ArrowRightIcon className="size-4 text-muted-foreground" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckIcon className="size-4 text-emerald-400" /> 100% Offline Local Inference
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="size-4 text-emerald-400" /> 40+ Pre-Bundled Neural Engines
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="size-4 text-emerald-400" /> No Monthly Character Limits
            </span>
          </div>
        </div>
      </section>

      {/* LIVE ACOUSTIC SOUND DEMO DECK */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="website-card rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Volume2Icon className="size-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Interactive Acoustic Sound Demo</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Listen to real-time harmonic vocal synthesis directly in your browser without cloud latency.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-foreground">
                <RadioIcon className={`size-3 ${isPlaying ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                {isPlaying ? 'Playing Live Harmonics' : 'Engine Ready'}
              </span>
            </div>
          </div>

          {/* Real-time Canvas Waveform */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-black/40 p-3">
            <canvas ref={canvasRef} width={900} height={70} className="w-full h-16 rounded-lg" />
            {isPlaying && activeVoice && (
              <div className="mt-2 flex items-center justify-between px-2 text-xs text-muted-foreground">
                <span className="truncate">Active Voice: <strong>{activeVoice.name}</strong></span>
                <span>{(playbackProgress * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Voice Preset Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_VOICES.map((voice) => {
              const isThisActive = activeVoice?.id === voice.id && isPlaying;
              return (
                <div
                  key={voice.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 transition ${
                    isThisActive
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                      : 'border-border/70 bg-card/60 hover:bg-muted/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {voice.tag}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{voice.pitch} Hz</span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-foreground">{voice.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {voice.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Button
                      size="sm"
                      variant={isThisActive ? 'default' : 'outline'}
                      onClick={() => handleTogglePlay(voice)}
                      className="h-8 w-full gap-2 text-xs font-semibold"
                    >
                      {isThisActive ? (
                        <>
                          <PauseIcon className="size-3.5" />
                          Stop Demo
                        </>
                      ) : (
                        <>
                          <PlayIcon className="size-3.5 fill-current" />
                          Play Preview
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ZapIcon className="size-3.5" />
            <span>Complete Architecture</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything You Need for Broadcast Voice AI
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-muted-foreground sm:text-sm">
            Six comprehensive creative workflows bundled into a single unified desktop application.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="website-card rounded-2xl p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <FingerprintIcon className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">Zero-Shot Voice Cloning</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Provide just 3 seconds of reference audio. Our localized F5-TTS, CosyVoice, and Chatterbox
              engines clone vocal timbre, natural breathing cadence, and acoustic room profile.
            </p>
          </div>

          <div className="website-card rounded-2xl p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
              <Wand2Icon className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">Generative Voice Design</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Craft original voice personas from natural language prompts. Define age, gender, accent,
              timbre, and emotional disposition without needing any reference audio files.
            </p>
          </div>

          <div className="website-card rounded-2xl p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
              <AudioLinesIcon className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">Multi-Track Video Dubbing</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Automatic video speech recognition, machine translation across 20+ languages, speaker
              diarization, and video subtitle re-timing for global distribution.
            </p>
          </div>

          <div className="website-card rounded-2xl p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <MicIcon className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">WhisperX GPU Dictation</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Sub-second speech-to-text with word-level phonetic alignment and voice activity detection.
              Dictate long-form text or transcribe meetings 100% on-device.
            </p>
          </div>

          <div className="website-card rounded-2xl p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <CpuIcon className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">40+ Neural AI Engines</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Directly load Kokoro-82M, KittenTTS, Supertonic, F5-TTS, and custom local checkpoints.
              Switch between lightweight ultra-fast CPU models and heavy GPU models seamlessly.
            </p>
          </div>

          <div className="website-card rounded-2xl p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <TerminalIcon className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">Local API & MCP Server</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Built-in OpenAI-compatible audio API endpoints (`/v1/audio/speech`, `/v1/audio/transcriptions`)
              and Anthropic Model Context Protocol (MCP) server for Claude Code and Cursor integration.
            </p>
          </div>
        </div>
      </section>

      {/* HARDWARE REQUIREMENTS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="website-card rounded-3xl p-8 sm:p-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Supported Hardware & Platforms</h2>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Engineered natively for modern desktop accelerators with full hardware acceleration.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <div className="text-2xl">🪟</div>
              <h3 className="mt-2 font-bold text-foreground">Windows 10 / 11 (64-bit)</h3>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• NVIDIA RTX GPU with CUDA 12.x</li>
                <li>• AMD Radeon GPU with DirectML</li>
                <li>• 16GB RAM minimum</li>
                <li>• Multi-core Intel/AMD CPU</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <div className="text-2xl">🍎</div>
              <h3 className="mt-2 font-bold text-foreground">macOS (Apple Silicon & Intel)</h3>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• Apple M1 / M2 / M3 / M4 (Metal accelerated)</li>
                <li>• macOS 13.0+ Ventura / Sonoma / Sequoia</li>
                <li>• 16GB Unified Memory recommended</li>
                <li>• Native ARM64 binary</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <div className="text-2xl">🐧</div>
              <h3 className="mt-2 font-bold text-foreground">Linux & Docker Containers</h3>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• Ubuntu, Debian, Fedora, Arch Linux</li>
                <li>• NVIDIA Container Toolkit (CUDA)</li>
                <li>• AMD ROCm container support</li>
                <li>• Universal AppImage & Docker image</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & SOCIAL PROOF */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Trusted by Creators and Audio Engineers</h2>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Read what studios, developers, and educators say about sovereign local voice intelligence.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div key={idx} className="website-card rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-xs leading-relaxed text-muted-foreground italic">
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/40">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t.author}</h4>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Frequently Asked Questions</h2>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Everything you need to know about AlphaVoice Studio, offline execution, and commercial rights.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 transition"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-foreground hover:bg-muted/30"
                >
                  <span>{faq.q}</span>
                  <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs leading-relaxed text-muted-foreground border-t border-border/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="website-card rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Start Producing Studio Speech Locally Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs text-muted-foreground sm:text-sm">
            Download the native installer for Windows, macOS, or Linux. No account or credit card required for the core version.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/download"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-8 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95"
            >
              <DownloadIcon className="size-4" />
              Download Free (v0.1.0)
            </Link>
            <Link
              to="/pricing"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border/80 bg-card px-8 text-xs font-semibold text-foreground hover:bg-muted"
            >
              View Commercial Pricing &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
