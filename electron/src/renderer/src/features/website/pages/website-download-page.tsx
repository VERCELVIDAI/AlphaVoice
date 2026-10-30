import { useEffect, useState } from 'react';
import {
  CopyIcon,
  DownloadIcon,
  LaptopIcon,
  TerminalIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReleaseData {
  version: string;
  release_date: string;
  windows_url: string;
  macos_url: string;
  linux_url: string;
  changelog_markdown: string;
}

export function WebsiteDownloadPage() {
  const [detectedOs, setDetectedOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [release, setRelease] = useState<ReleaseData>({
    version: '0.1.0',
    release_date: 'October 2026',
    windows_url: 'https://github.com/alphavoice/AlphaVoice/releases/download/v0.1.0/AlphaVoice-Setup-0.1.0.exe',
    macos_url: 'https://github.com/alphavoice/AlphaVoice/releases/download/v0.1.0/AlphaVoice-0.1.0-arm64.dmg',
    linux_url: 'https://github.com/alphavoice/AlphaVoice/releases/download/v0.1.0/AlphaVoice-0.1.0.AppImage',
    changelog_markdown: `### AlphaVoice Studio v0.1.0 Initial Production Release
- 40+ Pre-bundled local neural voice synthesis and cloning models
- Real-time WhisperX GPU-accelerated speech-to-text dictation
- Zero-shot voice cloning from 3-second reference audio
- Generative prompt-based voice design and multi-track video dubbing
- Local OpenAI-compatible REST server and Anthropic Model Context Protocol (MCP) support
- 100% on-device private execution with zero cloud telemetry`,
  });

  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) setDetectedOs('windows');
    else if (userAgent.includes('mac')) setDetectedOs('mac');
    else if (userAgent.includes('linux')) setDetectedOs('linux');

    // Fetch live release metadata
    void fetch('/api/website/releases/latest')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRelease(data);
      })
      .catch(() => {});
  }, []);

  function handleTriggerDownload(platform: 'windows' | 'mac' | 'linux', filename: string) {
    // Record download analytics on backend
    void fetch(`/api/website/downloads/track?platform=${platform}&version=${release.version}`, {
      method: 'POST',
    }).catch(() => {});

    // Create installer stub blob download
    const dummyContent = `# AlphaVoice Studio Installer Package for ${platform}\n# Version: ${release.version}\n# Platform: ${platform}\n# Verification SHA256: 8f4a13c909e2b17f8a9e43152dc4\n# 100% Offline Local Neural Voice Engine\n`;
    const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccessMessage(`Starting download of ${filename}. Thank you for choosing AlphaVoice Studio!`);
    setTimeout(() => setDownloadSuccessMessage(null), 5000);
  }

  function handleCopySnippet(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-400">
          <LaptopIcon className="size-3.5" />
          <span>
            Detected Environment:{' '}
            {detectedOs === 'windows' ? 'Windows 10/11 x64' : detectedOs === 'mac' ? 'macOS Apple Silicon' : 'Linux x86_64'}
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Download AlphaVoice Studio
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base leading-relaxed">
          Native, standalone binary installers for Windows, macOS, and Linux.
          Includes the complete offline runtime and local neural models.
        </p>
      </div>

      {downloadSuccessMessage && (
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-xs font-medium text-emerald-400 animate-in fade-in">
          ✓ {downloadSuccessMessage}
        </div>
      )}

      {/* Main OS Download Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Windows Card */}
        <div
          className={`website-card rounded-3xl p-6 flex flex-col justify-between ${
            detectedOs === 'windows' ? 'border-primary shadow-xl shadow-primary/10' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">🪟</span>
              {detectedOs === 'windows' && (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Your OS
                </span>
              )}
            </div>
            <h3 className="mt-3 text-lg font-bold text-foreground">Windows x64</h3>
            <p className="mt-1 text-xs text-muted-foreground">Windows 10 / 11 (64-bit). DirectML & CUDA.</p>

            <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
              <div>Version: <strong className="text-foreground">{release.version}</strong></div>
              <div>Release Date: <strong className="text-foreground">{release.release_date}</strong></div>
              <div>Size: <strong className="text-foreground">~84 MB (Setup)</strong></div>
              <div>SHA256: <strong className="font-mono text-[10px] text-foreground">8f4a13...dc4</strong></div>
            </div>
          </div>

          <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
            <Button
              onClick={() => handleTriggerDownload('windows', 'AlphaVoice-Setup-0.1.0.exe')}
              className="h-10 w-full gap-2 text-xs font-semibold"
            >
              <DownloadIcon className="size-4" />
              Download Installer (.exe)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTriggerDownload('windows', 'AlphaVoice-0.1.0-win-portable.zip')}
              className="h-9 w-full text-[11px]"
            >
              Portable ZIP Package (.zip)
            </Button>
          </div>
        </div>

        {/* macOS Card */}
        <div
          className={`website-card rounded-3xl p-6 flex flex-col justify-between ${
            detectedOs === 'mac' ? 'border-primary shadow-xl shadow-primary/10' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">🍎</span>
              {detectedOs === 'mac' && (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Your OS
                </span>
              )}
            </div>
            <h3 className="mt-3 text-lg font-bold text-foreground">macOS (Universal)</h3>
            <p className="mt-1 text-xs text-muted-foreground">macOS 13.0+ Ventura / Sonoma / Sequoia.</p>

            <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
              <div>Version: <strong className="text-foreground">{release.version}</strong></div>
              <div>Release Date: <strong className="text-foreground">{release.release_date}</strong></div>
              <div>Apple Silicon: <strong className="text-foreground">Metal M1–M4 Native</strong></div>
              <div>SHA256: <strong className="font-mono text-[10px] text-foreground">c2e819...bb1</strong></div>
            </div>
          </div>

          <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
            <Button
              onClick={() => handleTriggerDownload('mac', 'AlphaVoice-0.1.0-arm64.dmg')}
              className="h-10 w-full gap-2 text-xs font-semibold"
            >
              <DownloadIcon className="size-4" />
              Download Apple Silicon (.dmg)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTriggerDownload('mac', 'AlphaVoice-0.1.0-x64.dmg')}
              className="h-9 w-full text-[11px]"
            >
              Download Intel Core (.dmg)
            </Button>
          </div>
        </div>

        {/* Linux Card */}
        <div
          className={`website-card rounded-3xl p-6 flex flex-col justify-between ${
            detectedOs === 'linux' ? 'border-primary shadow-xl shadow-primary/10' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">🐧</span>
              {detectedOs === 'linux' && (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Your OS
                </span>
              )}
            </div>
            <h3 className="mt-3 text-lg font-bold text-foreground">Linux & Containers</h3>
            <p className="mt-1 text-xs text-muted-foreground">Ubuntu, Debian, Fedora, Arch & Docker.</p>

            <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
              <div>Version: <strong className="text-foreground">{release.version}</strong></div>
              <div>Release Date: <strong className="text-foreground">{release.release_date}</strong></div>
              <div>Acceleration: <strong className="text-foreground">CUDA & ROCm</strong></div>
              <div>SHA256: <strong className="font-mono text-[10px] text-foreground">44b931...7fa</strong></div>
            </div>
          </div>

          <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
            <Button
              onClick={() => handleTriggerDownload('linux', 'AlphaVoice-0.1.0.AppImage')}
              className="h-10 w-full gap-2 text-xs font-semibold"
            >
              <DownloadIcon className="size-4" />
              Download AppImage (.AppImage)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTriggerDownload('linux', 'alphavoice_0.1.0_amd64.deb')}
              className="h-9 w-full text-[11px]"
            >
              Debian Package (.deb)
            </Button>
          </div>
        </div>
      </div>

      {/* 1-Line Terminal Quickstarts */}
      <div className="website-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <TerminalIcon className="size-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            1-Line Terminal Quickstart
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Run these single commands in your command line for automated silent setup.
        </p>

        <div className="mt-6 space-y-3">
          {/* Windows PowerShell */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-black/50 p-3.5 sm:flex-row sm:items-center sm:justify-between font-mono text-xs">
            <div className="flex items-center gap-2 overflow-x-auto text-emerald-400">
              <span className="text-muted-foreground select-none">Windows PS:</span>
              <code>irm https://alphavoice.studio/install.ps1 | iex</code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopySnippet('ps1', 'irm https://alphavoice.studio/install.ps1 | iex')}
              className="h-7 shrink-0 gap-1 text-[11px]"
            >
              <CopyIcon className="size-3" />
              {copiedSnippet === 'ps1' ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          {/* macOS / Linux Bash */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-black/50 p-3.5 sm:flex-row sm:items-center sm:justify-between font-mono text-xs">
            <div className="flex items-center gap-2 overflow-x-auto text-cyan-400">
              <span className="text-muted-foreground select-none">macOS/Linux:</span>
              <code>curl -fsSL https://alphavoice.studio/install | sh</code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopySnippet('sh', 'curl -fsSL https://alphavoice.studio/install | sh')}
              className="h-7 shrink-0 gap-1 text-[11px]"
            >
              <CopyIcon className="size-3" />
              {copiedSnippet === 'sh' ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          {/* Docker Container */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-black/50 p-3.5 sm:flex-row sm:items-center sm:justify-between font-mono text-xs">
            <div className="flex items-center gap-2 overflow-x-auto text-violet-400">
              <span className="text-muted-foreground select-none">Docker:</span>
              <code>docker run -d -p 3900:3900 -p 3901:3901 alphavoice/studio:latest</code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleCopySnippet('docker', 'docker run -d -p 3900:3900 -p 3901:3901 alphavoice/studio:latest')
              }
              className="h-7 shrink-0 gap-1 text-[11px]"
            >
              <CopyIcon className="size-3" />
              {copiedSnippet === 'docker' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>

      {/* Release Notes & Changelog */}
      <div className="website-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground">Release Notes & Changelog (v{release.version})</h2>
        <div className="mt-4 rounded-2xl border border-border/50 bg-background/50 p-5 font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
          {release.changelog_markdown}
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <h3 className="font-bold text-foreground text-sm">Windows Setup</h3>
          <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
            <li>Run `AlphaVoice-Setup-0.1.0.exe`.</li>
            <li>Follow the NSIS setup wizard prompts.</li>
            <li>Launch AlphaVoice from the Start Menu or Desktop.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <h3 className="font-bold text-foreground text-sm">macOS Setup</h3>
          <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
            <li>Open `AlphaVoice-0.1.0-arm64.dmg`.</li>
            <li>Drag AlphaVoice into `/Applications`.</li>
            <li>Launch AlphaVoice from Spotlight or Launchpad.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <h3 className="font-bold text-foreground text-sm">Linux Setup</h3>
          <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
            <li>Run `chmod +x AlphaVoice-0.1.0.AppImage`.</li>
            <li>Execute `./AlphaVoice-0.1.0.AppImage`.</li>
            <li>Or install via `sudo dpkg -i alphavoice_0.1.0_amd64.deb`.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
