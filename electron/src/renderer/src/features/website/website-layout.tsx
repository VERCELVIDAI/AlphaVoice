import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  ChevronDownIcon,
  DownloadIcon,
  LogOutIcon,
  MenuIcon,
  RadioIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';
import { brandIcon } from '@/lib/brand';
import { ThemeToggle } from '@/components/app-shell/theme-toggle';
import { useWebsiteAuth } from '@/lib/store/website-auth-store';
import './website-layout.css';

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export function WebsiteLayout({ children }: WebsiteLayoutProps) {
  const { user, isAuthenticated, isAdmin, logout } = useWebsiteAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const navLinks = [
    { to: '/features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/download', label: 'Download' },
    { to: '/docs', label: 'Docs' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="website-root">
      {/* Top Announcement Bar - Ultra-mini on mobile, expanded on desktop */}
      <aside
        aria-label="Announcement"
        className="border-b border-primary/20 bg-primary/10 px-3 py-1 sm:py-1.5 text-center text-[11px] sm:text-xs font-medium text-foreground transition-all"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 sm:gap-2 truncate leading-tight">
          <SparklesIcon className="size-2.5 sm:size-3 shrink-0 text-primary animate-pulse" />
          {/* Mobile compact view */}
          <span className="sm:hidden truncate">
            <strong className="font-semibold text-primary">v0.1.0 live</strong>
            <span className="mx-1 text-muted-foreground/60">·</span>
            <Link
              to="/download"
              className="font-semibold text-foreground underline underline-offset-2 hover:text-primary"
            >
              Get Installer &rarr;
            </Link>
          </span>
          {/* Desktop & tablet view */}
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <span>AlphaVoice Studio v0.1.0 Official Production Release is now live!</span>
            <Link
              to="/download"
              className="ml-1 font-semibold text-primary underline underline-offset-2 hover:opacity-80"
            >
              Get Installer &rarr;
            </Link>
          </span>
        </div>
      </aside>

      {/* Main SaaS Navbar */}
      <header className="website-nav-blur sticky top-0 z-40 border-b border-border/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img src={brandIcon} alt="AlphaVoice" className="size-7" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              AlphaVoice <span className="text-primary font-normal">Studio</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`transition-colors hover:text-foreground ${active ? 'text-primary font-semibold' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                  <ChevronDownIcon className="size-3 text-muted-foreground" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/80 bg-card p-1.5 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-border/60 px-3 py-2">
                      <p className="truncate text-xs font-semibold text-foreground">{user.full_name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                      <UserIcon className="size-3.5 text-primary" />
                      Customer Portal & Licenses
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/website"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                      >
                        <ShieldCheckIcon className="size-3.5 text-amber-400" />
                        Admin Management Console
                      </Link>
                    )}

                    <Link
                      to="/portal"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                      <SparklesIcon className="size-3.5 text-cyan-400" />
                      Storefront & Upgrades
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                    >
                      <LogOutIcon className="size-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg border border-border/80 bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  Create Account
                </Link>
              </>
            )}

            <Link
              to="/download"
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90"
            >
              <DownloadIcon className="size-3.5" />
              <span>Download Studio</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border/60 bg-background/95 px-4 pt-2 pb-6 backdrop-blur-2xl md:hidden">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Customer Portal & Licenses
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/website"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-amber-400 hover:bg-muted"
                    >
                      Admin Console
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 items-center justify-center rounded-lg border border-border/80 text-xs font-semibold text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground"
                  >
                    Register
                  </Link>
                </div>
              )}

              <Link
                to="/download"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground"
              >
                <DownloadIcon className="size-4" />
                Download AlphaVoice Studio
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Children Content */}
      <main className="flex-1">{children}</main>

      {/* Universal SaaS Footer */}
      <footer className="border-t border-border/60 bg-card/40 pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <img src={brandIcon} alt="" className="size-6" />
                <span className="text-base font-bold tracking-tight text-foreground">
                  AlphaVoice Studio
                </span>
              </Link>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                The independent, local-first neural voice AI platform. 100% on-device voice cloning,
                voice design, multilingual dubbing, and dictation without cloud subscriptions or telemetry.
              </p>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                  <RadioIcon className="size-3 animate-pulse" />
                  Local AI Inference Engine · Online
                </span>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Product</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">Voice Cloning</Link></li>
                <li><Link to="/features" className="hover:text-foreground">Voice Design</Link></li>
                <li><Link to="/features" className="hover:text-foreground">Video Dubbing</Link></li>
                <li><Link to="/features" className="hover:text-foreground">WhisperX Dictation</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Commercial Pricing</Link></li>
                <li><Link to="/download" className="hover:text-foreground">Download Center</Link></li>
              </ul>
            </div>

            {/* Developers Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Developers</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                <li><Link to="/docs" className="hover:text-foreground">Documentation</Link></li>
                <li><Link to="/docs" className="hover:text-foreground">Local REST API</Link></li>
                <li><Link to="/docs" className="hover:text-foreground">Model Context Protocol</Link></li>
                <li><Link to="/license-agreement" className="hover:text-foreground">License Agreement (EULA)</Link></li>
                <li><Link to="/download" className="hover:text-foreground">Release Notes</Link></li>
              </ul>
            </div>

            {/* Legal & Policies Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Legal & Policies</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/refund-policy" className="hover:text-foreground">Refund Policy</Link></li>
                <li><Link to="/delivery-policy" className="hover:text-foreground">Delivery Policy</Link></li>
                <li><Link to="/license-agreement" className="hover:text-foreground">Commercial EULA</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Support & Grievances</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} AlphaVoice Technologies. All rights reserved. GST Registered Entity.</p>
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/about" className="hover:text-foreground">About</Link>
              <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link to="/refund-policy" className="hover:text-foreground">Refunds</Link>
              <Link to="/contact" className="hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
