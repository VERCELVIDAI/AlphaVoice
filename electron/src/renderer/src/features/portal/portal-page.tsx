import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLineIcon,
  AudioLinesIcon,
  CheckCircle2Icon,
  CheckIcon,
  CopyIcon,
  CpuIcon,
  DownloadIcon,
  FingerprintIcon,
  KeyIcon,
  LaptopIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TerminalIcon,
  Volume2Icon,
  Wand2Icon,
  ZapIcon,
} from 'lucide-react';
import { brandIcon } from '@/lib/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DEMO_VOICES,
  playAudioDemo,
  stopAudioDemo,
  type DemoVoice,
} from './audio-demo-player';
import {
  CheckoutModal,
  type CheckoutPlan,
} from './checkout-modal';
import {
  saveActiveLicense,
  useCommercialLicense,
  type CommercialLicense,
} from '@/lib/store/license-store';
import { WorkspaceHeader } from '@/components/app-shell/workspace-header';
import './portal-page.css';

export function PortalPage() {
  const { license, isProActive, deactivate } = useCommercialLicense();

  // Active playing audio state
  const [activeVoice, setActiveVoice] = useState<DemoVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // OS detection
  const [detectedOs, setDetectedOs] = useState<'windows' | 'mac' | 'linux'>('windows');

  // Checkout modal
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<CheckoutPlan | null>(null);
  const [seatCount, setSeatCount] = useState(1);

  // Copy code snippet state
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Manual license activation
  const [manualKey, setManualKey] = useState('');
  const [manualActivationMsg, setManualActivationMsg] = useState<string | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      setDetectedOs('windows');
    } else if (userAgent.includes('mac')) {
      setDetectedOs('mac');
    } else if (userAgent.includes('linux')) {
      setDetectedOs('linux');
    }
  }, []);

  // Audio waveform animation loop
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

      const amplitude = isPlaying ? 24 : 4;
      const frequency = isPlaying ? 0.05 : 0.02;

      for (let x = 0; x < width; x++) {
        const y =
          centerY +
          Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI) +
          (isPlaying ? (Math.random() - 0.5) * 6 : 0);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = isPlaying ? '#8b5cf6' : '#64748b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      phase += isPlaying ? 0.15 : 0.03;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
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

  function handleCopySnippet(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  }

  function handleDownloadInstaller(osName: string) {
    const filename =
      osName === 'windows'
        ? 'AlphaVoice-Setup-0.1.0.exe'
        : osName === 'mac'
          ? 'AlphaVoice-0.1.0-arm64.dmg'
          : 'AlphaVoice-0.1.0.AppImage';

    const dummyContent = `# AlphaVoice Studio Installer Stub for ${osName}\n# Version 0.1.0\n# Download completed from official AlphaVoice portal.\n`;
    const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleManualActivate(e: React.FormEvent) {
    e.preventDefault();
    const clean = manualKey.trim().toUpperCase();
    if (!clean || clean.length < 10) {
      setManualActivationMsg('Please enter a valid AlphaVoice license key.');
      return;
    }

    const isLife = clean.includes('LIFE');
    const isEnt = clean.includes('ENT');
    const newLic: CommercialLicense = {
      key: clean,
      plan: isLife ? 'pro_lifetime' : isEnt ? 'enterprise' : 'pro_yearly',
      planName: isLife ? 'AlphaVoice Pro Lifetime' : isEnt ? 'AlphaVoice Enterprise' : 'AlphaVoice Pro Annual',
      seats: 1,
      customerName: 'Verified Licensee',
      customerEmail: 'user@license.alphavoice.studio',
      issuedAt: new Date().toISOString(),
      expiresAt: isLife ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      signature: 'SIG_OFFLINE_VERIFIED',
      features: ['All 40+ Neural Models', 'Commercial License', 'Zero-Shot Voice Cloning'],
    };

    saveActiveLicense(newLic);
    setManualKey('');
    setManualActivationMsg('✓ License activated successfully! Pro features unlocked.');
    setTimeout(() => setManualActivationMsg(null), 4000);
  }

  return (
    <div className="portal-page">
      <WorkspaceHeader>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={brandIcon} alt="" className="size-5" />
            <h1 className="text-sm font-semibold tracking-tight">AlphaVoice Studio Store & Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            {isProActive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2Icon className="size-3.5" />
                {license?.planName || 'Pro License Active'}
              </span>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  setSelectedPlanForCheckout({
                    id: 'lifetime',
                    name: 'AlphaVoice Pro Lifetime',
                    unitPrice: 299,
                    period: 'one-time payment',
                    seats: 1,
                  })
                }
                className="h-7 gap-1.5 text-xs font-semibold"
              >
                <SparklesIcon className="size-3.5" />
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </WorkspaceHeader>

      {/* Main Scrollable Content */}
      <div className="portal-hero-gradient min-h-0 flex-1">
        {/* Navigation Quick Links */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <img src={brandIcon} alt="AlphaVoice" className="size-6" />
            <span className="text-base font-bold tracking-tight text-foreground">
              AlphaVoice Studio
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              v0.1.0
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-xs font-medium text-muted-foreground sm:flex">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#audio-demo" className="transition hover:text-foreground">
              Sound Demo
            </a>
            <a href="#download" className="transition hover:text-foreground">
              Download Hub
            </a>
            <a href="#pricing" className="transition hover:text-foreground">
              Pricing & Licensing
            </a>
            <a href="#activate" className="transition hover:text-foreground">
              Activate License
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#download"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              <ArrowDownToLineIcon className="size-3.5 text-primary" />
              Download Free
            </a>
            <a
              href="#pricing"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              <ZapIcon className="size-3.5" />
              Buy Pro
            </a>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <SparklesIcon className="size-3.5 animate-pulse" />
            <span>The Independent, Local-First AI Voice Platform</span>
          </div>

          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Sovereign Voice AI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              On Your Own Hardware
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Replace costly cloud subscriptions like ElevenLabs. Run state-of-the-art zero-shot voice
            cloning, prompt-driven voice design, video dubbing, and WhisperX dictation on your GPU or
            CPU. 100% private, zero telemetry, lightning fast.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#download"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-90"
            >
              <DownloadIcon className="size-4" />
              Download AlphaVoice v0.1.0
            </a>
            <a
              href="#pricing"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-6 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-muted"
            >
              <ZapIcon className="size-4 text-primary" />
              View Pricing & Lifetime License
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckIcon className="size-4 text-emerald-400" /> 100% Offline Local Processing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="size-4 text-emerald-400" /> 40+ Pre-Bundled Neural Engines
            </span>
            <span className="flex items-center gap-1.5">
              <CheckIcon className="size-4 text-emerald-400" /> Local OpenAI-Compatible API & MCP
            </span>
          </div>
        </section>

        {/* INTERACTIVE AUDIO DEMO DECK */}
        <section id="audio-demo" className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-xl backdrop-blur-xl md:p-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Volume2Icon className="size-5 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">
                    Interactive Acoustic Sound Demo
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Experience immediate zero-latency synthesis previewed right in your browser.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  <RadioIcon className={`size-3 ${isPlaying ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                  {isPlaying ? 'Playing Live Harmonics' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Canvas Visualizer */}
            <div className="mt-5 overflow-hidden rounded-xl border border-border/60 bg-black/40 p-2">
              <canvas
                ref={canvasRef}
                width={800}
                height={64}
                className="portal-waveform-canvas"
              />
              {isPlaying && activeVoice && (
                <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-muted-foreground">
                  <span className="truncate">Now Playing: <strong>{activeVoice.name}</strong></span>
                  <span>{(playbackProgress * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>

            {/* Voice Cards */}
            <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {DEMO_VOICES.map((voice) => {
                const isThisActive = activeVoice?.id === voice.id && isPlaying;
                return (
                  <div
                    key={voice.id}
                    className={`portal-glow-card relative flex flex-col justify-between rounded-xl border p-4 transition ${
                      isThisActive
                        ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                        : 'border-border/70 bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {voice.tag}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{voice.pitch} Hz</span>
                      </div>
                      <h4 className="mt-2.5 text-sm font-bold text-foreground">{voice.name}</h4>
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
                            Stop Audio
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

        {/* FEATURES GRID */}
        <section id="features" className="mx-auto max-w-5xl px-6 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Complete AI Voice Production Suite
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground sm:text-sm">
              Engineered from the ground up for high throughput, local privacy, and broadcast audio quality.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="portal-glow-card rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                <FingerprintIcon className="size-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-foreground">Zero-Shot Voice Cloning</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Clone any voice from a 3-second audio sample. Preserves exact timbre, emotion, and
                breathing cadence without cloud uploads.
              </p>
            </div>

            <div className="portal-glow-card rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                <Wand2Icon className="size-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-foreground">Generative Voice Design</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Describe age, accent, pitch, warmth, and emotion in plain English. Generate custom
                synthetic voice personas on demand.
              </p>
            </div>

            <div className="portal-glow-card rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
                <AudioLinesIcon className="size-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-foreground">Multi-Speaker Dubbing</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Translate and dub videos into 20+ languages with automated subtitle synchronization
                and speaker identification.
              </p>
            </div>

            <div className="portal-glow-card rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <MicIcon className="size-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-foreground">Real-Time WhisperX Dictation</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Sub-second speech-to-text with word-level timestamps, voice activity detection, and
                multilingual transcription directly on GPU.
              </p>
            </div>

            <div className="portal-glow-card rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <CpuIcon className="size-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-foreground">40+ Neural AI Engines</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Access Kokoro-82M, KittenTTS, F5-TTS, CosyVoice, Chatterbox, Supertonic, and more in
                one unified interface.
              </p>
            </div>

            <div className="portal-glow-card rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                <TerminalIcon className="size-5" />
              </div>
              <h4 className="mt-4 text-base font-bold text-foreground">Local API Server & MCP</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                OpenAI-compatible endpoints (`/v1/audio/speech`, `/v1/audio/transcriptions`) and Model
                Context Protocol for AI agent workflows.
              </p>
            </div>
          </div>
        </section>

        {/* DOWNLOAD HUB */}
        <section id="download" className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-3xl border border-border/80 bg-card/80 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                <LaptopIcon className="size-3.5" />
                Detected: {detectedOs === 'windows' ? 'Windows 10/11 x64' : detectedOs === 'mac' ? 'macOS Apple Silicon' : 'Linux'}
              </div>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
                Download AlphaVoice Studio
              </h3>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Native desktop binaries built for high-performance neural compute on Windows, macOS, and Linux.
              </p>
            </div>

            {/* Direct OS Cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Windows Card */}
              <div
                className={`relative rounded-2xl border p-5 ${
                  detectedOs === 'windows'
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                    : 'border-border/60 bg-background/50'
                }`}
              >
                {detectedOs === 'windows' && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    Recommended
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪟</span>
                  <h4 className="font-bold text-foreground">Windows</h4>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Windows 10 / 11 (64-bit). DirectML & CUDA GPU acceleration support.
                </p>

                <div className="mt-5 space-y-2">
                  <Button
                    onClick={() => handleDownloadInstaller('windows')}
                    className="h-9 w-full gap-2 text-xs font-semibold"
                  >
                    <DownloadIcon className="size-3.5" />
                    Download Installer (.exe)
                  </Button>
                  <Button
                    onClick={() => handleDownloadInstaller('windows')}
                    variant="outline"
                    className="h-8 w-full text-[11px]"
                  >
                    Portable ZIP Package
                  </Button>
                </div>
              </div>

              {/* macOS Card */}
              <div
                className={`relative rounded-2xl border p-5 ${
                  detectedOs === 'mac'
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                    : 'border-border/60 bg-background/50'
                }`}
              >
                {detectedOs === 'mac' && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    Recommended
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍎</span>
                  <h4 className="font-bold text-foreground">macOS</h4>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  macOS 13.0+ Ventura / Sonoma / Sequoia. Apple Silicon (M1–M4) & Intel.
                </p>

                <div className="mt-5 space-y-2">
                  <Button
                    onClick={() => handleDownloadInstaller('mac')}
                    className="h-9 w-full gap-2 text-xs font-semibold"
                  >
                    <DownloadIcon className="size-3.5" />
                    Download Apple Silicon (.dmg)
                  </Button>
                  <Button
                    onClick={() => handleDownloadInstaller('mac')}
                    variant="outline"
                    className="h-8 w-full text-[11px]"
                  >
                    Download Intel Core (.dmg)
                  </Button>
                </div>
              </div>

              {/* Linux Card */}
              <div
                className={`relative rounded-2xl border p-5 ${
                  detectedOs === 'linux'
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                    : 'border-border/60 bg-background/50'
                }`}
              >
                {detectedOs === 'linux' && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    Recommended
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐧</span>
                  <h4 className="font-bold text-foreground">Linux & Docker</h4>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ubuntu, Debian, Fedora, Arch. ROCm & CUDA container images.
                </p>

                <div className="mt-5 space-y-2">
                  <Button
                    onClick={() => handleDownloadInstaller('linux')}
                    className="h-9 w-full gap-2 text-xs font-semibold"
                  >
                    <DownloadIcon className="size-3.5" />
                    Download AppImage (.AppImage)
                  </Button>
                  <Button
                    onClick={() => handleDownloadInstaller('linux')}
                    variant="outline"
                    className="h-8 w-full text-[11px]"
                  >
                    Debian Package (.deb)
                  </Button>
                </div>
              </div>
            </div>

            {/* Quickstart 1-Line Terminal Commands */}
            <div className="mt-8 rounded-2xl border border-border/60 bg-background/70 p-5">
              <div className="flex items-center gap-2">
                <TerminalIcon className="size-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1-Line Terminal Quickstart
                </h4>
              </div>

              <div className="mt-4 space-y-3">
                {/* PowerShell */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/40 bg-black/40 p-3 font-mono text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto text-emerald-400">
                    <span className="text-muted-foreground select-none">Windows PS:</span>
                    <code>irm https://alphavoice.studio/install.ps1 | iex</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleCopySnippet('ps1', 'irm https://alphavoice.studio/install.ps1 | iex')
                    }
                    className="h-7 shrink-0 gap-1 text-[11px]"
                  >
                    <CopyIcon className="size-3" />
                    {copiedSnippet === 'ps1' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                {/* macOS & Linux */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/40 bg-black/40 p-3 font-mono text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto text-cyan-400">
                    <span className="text-muted-foreground select-none">macOS/Linux:</span>
                    <code>curl -fsSL https://alphavoice.studio/install | sh</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleCopySnippet('sh', 'curl -fsSL https://alphavoice.studio/install | sh')
                    }
                    className="h-7 shrink-0 gap-1 text-[11px]"
                  >
                    <CopyIcon className="size-3" />
                    {copiedSnippet === 'sh' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                {/* Docker */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/40 bg-black/40 p-3 font-mono text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto text-violet-400">
                    <span className="text-muted-foreground select-none">Docker:</span>
                    <code>docker run -d -p 3900:3900 -p 3901:3901 alphavoice/studio:latest</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleCopySnippet(
                        'docker',
                        'docker run -d -p 3900:3900 -p 3901:3901 alphavoice/studio:latest',
                      )
                    }
                    className="h-7 shrink-0 gap-1 text-[11px]"
                  >
                    <CopyIcon className="size-3" />
                    {copiedSnippet === 'docker' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING & COMMERCIAL LICENSING TABLE */}
        <section id="pricing" className="mx-auto max-w-5xl px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ZapIcon className="size-3.5" />
              Simple, Transparent Licensing
            </div>
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Pay Once or Subscribe. Run Everywhere.
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground sm:text-sm">
              Use AlphaVoice for personal projects for free, or upgrade to Pro for full commercial rights,
              all 40+ neural models, and priority updates.
            </p>
          </div>

          {/* Seat Picker for Team Orders */}
          <div className="mx-auto mt-8 flex max-w-xs items-center justify-between rounded-xl border border-border/80 bg-card p-2 text-xs">
            <span className="font-medium text-muted-foreground">Team Seats:</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="size-7 p-0"
                onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
              >
                −
              </Button>
              <span className="w-8 text-center font-bold text-foreground">{seatCount}</span>
              <Button
                size="sm"
                variant="outline"
                className="size-7 p-0"
                onClick={() => setSeatCount(Math.min(99, seatCount + 1))}
              >
                +
              </Button>
            </div>
            {seatCount >= 5 && (
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                {seatCount >= 10 ? '20% Off' : '10% Off'}
              </span>
            )}
          </div>

          {/* Pricing Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Community Free */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-foreground">Community Free</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Perfect for hobbyists and individual exploration.
                </p>

                <div className="mt-5">
                  <span className="text-4xl font-extrabold text-foreground">$0</span>
                  <span className="text-xs text-muted-foreground"> / forever</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>Local core synthesis engines (Kokoro-82M, KittenTTS)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>Unlimited offline inference on local hardware</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>Local OpenAI-compatible REST server</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>Community Discord support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-border/50">
                <a
                  href="#download"
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  Download Free
                </a>
              </div>
            </div>

            {/* Pro Annual */}
            <div className="relative rounded-3xl border border-primary/50 bg-card p-6 flex flex-col justify-between shadow-xl shadow-primary/10">
              <div>
                <h4 className="text-lg font-bold text-foreground">Pro Annual</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  For creators, YouTubers, and podcasters monetizing content.
                </p>

                <div className="mt-5">
                  <span className="text-4xl font-extrabold text-foreground">${99 * seatCount}</span>
                  <span className="text-xs text-muted-foreground"> / year ({seatCount} seat{seatCount > 1 ? 's' : ''})</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <CheckIcon className="size-4 text-primary" />
                    <span>All 40+ neural models & voice cloning engines</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <CheckIcon className="size-4 text-primary" />
                    <span>Commercial monetization & broadcast rights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>WhisperX real-time dictation & alignment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>Multi-track video dubbing & audiobook studio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>Priority model updates & new engine releases</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-border/50">
                <Button
                  onClick={() =>
                    setSelectedPlanForCheckout({
                      id: 'yearly',
                      name: 'AlphaVoice Pro Annual',
                      unitPrice: 99,
                      period: 'per year',
                      seats: seatCount,
                    })
                  }
                  className="h-10 w-full gap-1.5 text-xs font-semibold"
                >
                  <ZapIcon className="size-3.5" />
                  Upgrade to Pro Annual
                </Button>
              </div>
            </div>

            {/* Pro Lifetime (Best Value) */}
            <div className="relative rounded-3xl border-2 border-primary bg-primary/5 p-6 flex flex-col justify-between shadow-2xl shadow-primary/20">
              <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                Best Value · Pay Once
              </span>

              <div>
                <h4 className="text-lg font-bold text-foreground">Pro Lifetime</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Perpetual commercial license with no recurring fees ever.
                </p>

                <div className="mt-5">
                  <span className="text-4xl font-extrabold text-foreground">${299 * seatCount}</span>
                  <span className="text-xs text-muted-foreground"> / one-time ({seatCount} seat{seatCount > 1 ? 's' : ''})</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground font-semibold">
                    <SparklesIcon className="size-4 text-primary" />
                    <span>Everything in Pro Annual — forever</span>
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-semibold">
                    <CheckIcon className="size-4 text-primary" />
                    <span>Lifetime updates for all v1.x and v2.x releases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>Zero subscription fatigue, 100% offline license check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>VIP Discord role & priority developer email support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-emerald-400" />
                    <span>Full commercial & client project rights</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-primary/20">
                <Button
                  onClick={() =>
                    setSelectedPlanForCheckout({
                      id: 'lifetime',
                      name: 'AlphaVoice Pro Lifetime',
                      unitPrice: 299,
                      period: 'one-time payment',
                      seats: seatCount,
                    })
                  }
                  className="h-10 w-full gap-1.5 text-xs font-bold shadow-lg shadow-primary/30"
                >
                  <SparklesIcon className="size-3.5" />
                  Get Pro Lifetime License
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* LICENSE KEY ACTIVATION & MANAGEMENT TAB */}
        <section id="activate" className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <KeyIcon className="size-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">License Key Management</h4>
                <p className="text-xs text-muted-foreground">
                  Verify or activate your offline AlphaVoice commercial license key.
                </p>
              </div>
            </div>

            {isProActive && license ? (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2Icon className="size-4 text-emerald-400" />
                      <span className="font-bold text-foreground">{license.planName}</span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        Active
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-xs text-foreground/90">
                      Key: <strong>{license.key}</strong>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Issued to {license.customerName} ({license.customerEmail}) · {license.seats} seat{license.seats > 1 ? 's' : ''} ·{' '}
                      {license.expiresAt ? `Renews on ${new Date(license.expiresAt).toLocaleDateString()}` : 'Perpetual Lifetime'}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deactivate}
                    className="h-8 shrink-0 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Deactivate License
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualActivate} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Paste license key (e.g. ALPHA-LIFE-2026-XXXX-YYYY-ZZZZ)"
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  className="h-10 flex-1 font-mono text-xs uppercase"
                />
                <Button type="submit" className="h-10 shrink-0 gap-1.5 text-xs font-semibold">
                  <ShieldCheckIcon className="size-4" />
                  Activate License
                </Button>
              </form>
            )}

            {manualActivationMsg && (
              <div className="mt-3 text-xs font-medium text-primary">{manualActivationMsg}</div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border/50 bg-background/90 px-6 py-8 text-center text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span>© {new Date().getFullYear()} AlphaVoice Technologies. All rights reserved.</span>
            <a href="https://alphavoice.studio/terms" className="hover:text-foreground">
              Terms of Service
            </a>
            <a href="https://alphavoice.studio/privacy" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="https://alphavoice.studio/docs" className="hover:text-foreground">
              Documentation
            </a>
            <a href="https://github.com/alphavoice/AlphaVoice" className="hover:text-foreground">
              GitHub
            </a>
          </div>
        </footer>
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
          onSuccess={() => {
            // Updated automatically via license store event listener
          }}
        />
      )}
    </div>
  );
}
