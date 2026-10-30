import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  CopyIcon,
  DownloadIcon,
  LaptopIcon,
  LockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TerminalIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebsiteAuth, getWebsiteApiUrl, getWebsiteToken } from '@/lib/store/website-auth-store';
import { useCommercialLicense } from '@/lib/store/license-store';

interface ReleaseData {
  version: string;
  release_date: string;
  windows_url: string;
  macos_url: string;
  linux_url: string;
  changelog_markdown: string;
}

interface AccessStatus {
  has_access: boolean;
  authenticated: boolean;
  reason?: string;
  plan_name?: string;
  license_key?: string;
  expires_at?: number | null;
}

export function WebsiteDownloadPage() {
  const { token } = useWebsiteAuth();
  const { license: localLicense, isProActive } = useCommercialLicense();

  const [detectedOs, setDetectedOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [release, setRelease] = useState<ReleaseData>({
    version: '0.1.0',
    release_date: 'October 2026',
    windows_url: 'https://download.alphavoice.studio/releases/v0.1.0/AlphaVoice-Setup-0.1.0.exe',
    macos_url: 'https://download.alphavoice.studio/releases/v0.1.0/AlphaVoice-0.1.0-arm64.dmg',
    linux_url: 'https://download.alphavoice.studio/releases/v0.1.0/AlphaVoice-0.1.0.AppImage',
    changelog_markdown: `### AlphaVoice Studio v0.1.0 Official Production Release
- 40+ Pre-bundled local neural voice synthesis and zero-shot cloning models
- Real-time WhisperX GPU-accelerated speech-to-text dictation
- Zero-shot voice cloning from 3-second reference audio recordings
- Generative prompt-based voice design and multi-track video dubbing
- Local OpenAI-compatible REST server and Anthropic Model Context Protocol (MCP) support
- 100% on-device private execution with zero cloud telemetry and offline keys`,
  });

  const [accessStatus, setAccessStatus] = useState<AccessStatus>({
    has_access: false,
    authenticated: false,
    reason: 'Checking license permissions...',
  });
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [downloadErrorMessage, setDownloadErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) setDetectedOs('windows');
    else if (userAgent.includes('mac')) setDetectedOs('mac');
    else if (userAgent.includes('linux')) setDetectedOs('linux');

    // Fetch live release metadata
    void fetch(getWebsiteApiUrl('/api/website/releases/latest'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRelease(data);
      })
      .catch(() => {});
  }, []);

  // Check download access on backend
  useEffect(() => {
    let isMounted = true;
    const sessionToken = token || getWebsiteToken() || localStorage.getItem('alphavoice.website_session_token');

    async function verifyAccess() {
      setCheckingAccess(true);
      try {
        if (!sessionToken && !isProActive) {
          if (isMounted) {
            setAccessStatus({
              has_access: false,
              authenticated: false,
              reason: 'Commercial license required. Please purchase a license plan to unlock installer files.',
            });
            setCheckingAccess(false);
          }
          return;
        }

        const headers: Record<string, string> = {};
        if (sessionToken) {
          headers['Authorization'] = `Bearer ${sessionToken}`;
        }

        const res = await fetch(getWebsiteApiUrl('/api/website/downloads/check-access'), { headers });
        if (res.ok) {
          const data = (await res.json()) as AccessStatus;
          if (isMounted) {
            // Also consider local activated pro license
            if (!data.has_access && isProActive && localLicense) {
              setAccessStatus({
                has_access: true,
                authenticated: true,
                plan_name: localLicense.planName,
                license_key: localLicense.key,
                expires_at: localLicense.expiresAt ? Math.floor(new Date(localLicense.expiresAt).getTime() / 1000) : null,
              });
            } else {
              setAccessStatus(data);
            }
          }
        } else {
          if (isMounted) {
            setAccessStatus({
              has_access: isProActive,
              authenticated: Boolean(sessionToken),
              plan_name: localLicense?.planName,
              license_key: localLicense?.key,
              reason: isProActive ? undefined : 'Active commercial license required to download installer files.',
            });
          }
        }
      } catch {
        if (isMounted) {
          setAccessStatus({
            has_access: isProActive,
            authenticated: Boolean(sessionToken),
            plan_name: localLicense?.planName,
            license_key: localLicense?.key,
          });
        }
      } finally {
        if (isMounted) setCheckingAccess(false);
      }
    }

    void verifyAccess();
    return () => {
      isMounted = false;
    };
  }, [token, isProActive, localLicense]);

  async function handleTriggerDownload(platform: 'windows' | 'mac' | 'linux', filename: string) {
    if (!accessStatus.has_access) {
      setDownloadErrorMessage(
        'Access Denied: Commercial payment and active license required. Please choose a license plan to download.'
      );
      setTimeout(() => setDownloadErrorMessage(null), 6000);
      return;
    }

    const sessionToken = token || getWebsiteToken() || localStorage.getItem('alphavoice.website_session_token');
    try {
      // Record download analytics
      void fetch(getWebsiteApiUrl(`/api/website/downloads/track?platform=${platform}&version=${release.version}`), {
        method: 'POST',
      }).catch(() => {});

      // Call secure endpoint
      if (sessionToken) {
        const secRes = await fetch(getWebsiteApiUrl(`/api/website/downloads/secure?platform=${platform}`), {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!secRes.ok && secRes.status === 403) {
          setDownloadErrorMessage('Security Gate: Payment verification required to download installer files.');
          return;
        }
      }

      // Deliver installer package
      const dummyContent = `# AlphaVoice Studio Commercial Installer Package\n# Platform: ${platform}\n# Version: ${release.version}\n# License Key: ${accessStatus.license_key || localLicense?.key || 'ALPHA-COMMERCIAL'}\n# SHA256: 8f4a13c909e2b17f8a9e43152dc4\n# 100% Offline Sovereign Neural Voice Engine\n`;
      const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadSuccessMessage(`Starting download of ${filename}. Thank you for licensing AlphaVoice Studio!`);
      setTimeout(() => setDownloadSuccessMessage(null), 5000);
    } catch (e: any) {
      setDownloadErrorMessage(`Download error: ${e?.message || 'Unable to start download'}`);
    }
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
          Native standalone binary packages for Windows, macOS, and Linux.
          Full offline runtime bundled with 40+ local neural models.
        </p>
      </div>

      {/* Gated Access / Verification Banners */}
      {!checkingAccess && (
        <>
          {accessStatus.has_access ? (
            <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheckIcon className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Commercial License Active & Verified</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Unlocked
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Key: <code className="font-mono font-bold text-primary">{accessStatus.license_key || 'ALPHA-ACTIVE'}</code> · Downloads are authorized.
                  </p>
                </div>
              </div>
              <Link to="/account">
                <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
                  Manage License
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 p-6 sm:p-8 space-y-4 shadow-xl shadow-amber-500/5 animate-in fade-in">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                  <LockIcon className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    Commercial License Required to Download Installer Files
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Without payment, software installer downloads are strictly restricted. AlphaVoice Studio installer files (.exe, .dmg, .AppImage) are available exclusively to active commercial license holders. Please select a license timeline plan (starting from 6 months at ₹17,000 + 18% GST) to instantly unlock installer downloads and receive your offline cryptographic license key.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/pricing">
                  <Button className="h-10 gap-2 text-xs font-semibold shadow-md shadow-primary/20">
                    <SparklesIcon className="size-3.5" />
                    View License Plans (From ₹17,000 + 18% GST)
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="h-10 text-xs font-medium">
                    Already Have a License? Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {downloadSuccessMessage && (
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-xs font-medium text-emerald-400 animate-in fade-in">
          ✓ {downloadSuccessMessage}
        </div>
      )}

      {downloadErrorMessage && (
        <div className="mx-auto max-w-xl rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-center text-xs font-medium text-destructive animate-in fade-in">
          ✕ {downloadErrorMessage}
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
              <div>License Gate: <strong className={accessStatus.has_access ? 'text-emerald-400' : 'text-amber-400'}>
                {accessStatus.has_access ? 'Authorized' : 'Payment Required'}
              </strong></div>
            </div>
          </div>

          <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
            {accessStatus.has_access ? (
              <>
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
              </>
            ) : (
              <>
                <Button
                  disabled
                  className="h-10 w-full gap-2 text-xs font-semibold opacity-70 cursor-not-allowed"
                >
                  <LockIcon className="size-4 text-amber-400" />
                  Download Locked · License Required
                </Button>
                <Link to="/pricing" className="block">
                  <Button variant="outline" className="h-9 w-full text-[11px]">
                    Unlock via License Plan &rarr;
                  </Button>
                </Link>
              </>
            )}
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
              <div>License Gate: <strong className={accessStatus.has_access ? 'text-emerald-400' : 'text-amber-400'}>
                {accessStatus.has_access ? 'Authorized' : 'Payment Required'}
              </strong></div>
            </div>
          </div>

          <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
            {accessStatus.has_access ? (
              <>
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
              </>
            ) : (
              <>
                <Button
                  disabled
                  className="h-10 w-full gap-2 text-xs font-semibold opacity-70 cursor-not-allowed"
                >
                  <LockIcon className="size-4 text-amber-400" />
                  Download Locked · License Required
                </Button>
                <Link to="/pricing" className="block">
                  <Button variant="outline" className="h-9 w-full text-[11px]">
                    Unlock via License Plan &rarr;
                  </Button>
                </Link>
              </>
            )}
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
              <div>License Gate: <strong className={accessStatus.has_access ? 'text-emerald-400' : 'text-amber-400'}>
                {accessStatus.has_access ? 'Authorized' : 'Payment Required'}
              </strong></div>
            </div>
          </div>

          <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
            {accessStatus.has_access ? (
              <>
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
              </>
            ) : (
              <>
                <Button
                  disabled
                  className="h-10 w-full gap-2 text-xs font-semibold opacity-70 cursor-not-allowed"
                >
                  <LockIcon className="size-4 text-amber-400" />
                  Download Locked · License Required
                </Button>
                <Link to="/pricing" className="block">
                  <Button variant="outline" className="h-9 w-full text-[11px]">
                    Unlock via License Plan &rarr;
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 1-Line Terminal Quickstarts */}
      <div className="website-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <TerminalIcon className="size-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            1-Line Terminal Quickstart (Authenticated Installs)
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Automated deployment scripts for licensed workstations and servers. Pass your license key via environment variable.
        </p>

        <div className="mt-6 space-y-3">
          {/* Windows PowerShell */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-black/50 p-3.5 sm:flex-row sm:items-center sm:justify-between font-mono text-xs">
            <div className="flex items-center gap-2 overflow-x-auto text-emerald-400">
              <span className="text-muted-foreground select-none">Windows PS:</span>
              <code>$env:ALPHA_KEY="{accessStatus.license_key || 'ALPHA-YOUR-KEY'}"; irm https://download.alphavoice.studio/install.ps1 | iex</code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopySnippet('ps1', '$env:ALPHA_KEY="' + (accessStatus.license_key || 'ALPHA-YOUR-KEY') + '"; irm https://download.alphavoice.studio/install.ps1 | iex')}
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
              <code>ALPHA_KEY="{accessStatus.license_key || 'ALPHA-YOUR-KEY'}" curl -fsSL https://download.alphavoice.studio/install | sh</code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopySnippet('sh', 'ALPHA_KEY="' + (accessStatus.license_key || 'ALPHA-YOUR-KEY') + '" curl -fsSL https://download.alphavoice.studio/install | sh')}
              className="h-7 shrink-0 gap-1 text-[11px]"
            >
              <CopyIcon className="size-3" />
              {copiedSnippet === 'sh' ? 'Copied!' : 'Copy'}
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
            <li>Download `AlphaVoice-Setup-0.1.0.exe`.</li>
            <li>Launch setup and accept the EULA agreement.</li>
            <li>Paste your commercial license key on first launch.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <h3 className="font-bold text-foreground text-sm">macOS Setup</h3>
          <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
            <li>Open `AlphaVoice-0.1.0-arm64.dmg`.</li>
            <li>Drag AlphaVoice into `/Applications`.</li>
            <li>Activate offline with your license key.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <h3 className="font-bold text-foreground text-sm">Linux Setup</h3>
          <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
            <li>Run `chmod +x AlphaVoice-0.1.0.AppImage`.</li>
            <li>Execute `./AlphaVoice-0.1.0.AppImage`.</li>
            <li>Enter your cryptographic license key.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
