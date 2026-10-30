import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  DownloadIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWebsiteAuth, getWebsiteApiUrl, getWebsiteToken } from '@/lib/store/website-auth-store';

interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  total_revenue_usd: number;
  total_downloads: number;
  pending_inquiries: number;
}

export function WebsiteAdminPage() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useWebsiteAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'inquiries' | 'releases' | 'purchases'>('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New release form
  const [relVersion, setRelVersion] = useState('0.1.1');
  const [relDate, setRelDate] = useState('November 2026');
  const [relWinUrl, setRelWinUrl] = useState('https://download.alphavoice.studio/releases/v0.1.1/AlphaVoice-Setup-0.1.1.exe');
  const [relMacUrl, setRelMacUrl] = useState('https://download.alphavoice.studio/releases/v0.1.1/AlphaVoice-0.1.1-arm64.dmg');
  const [relLinUrl, setRelLinUrl] = useState('https://download.alphavoice.studio/releases/v0.1.1/AlphaVoice-0.1.1.AppImage');
  const [relChangelog, setRelChangelog] = useState('### What is New in v0.1.1\n- Performance improvements and model updates.');
  const [relPublishFeedback, setRelPublishFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/login' });
      return;
    }
    if (!isAdmin) {
      void navigate({ to: '/account' });
      return;
    }

    loadAdminData();
  }, [isAuthenticated, isAdmin, navigate]);

  async function loadAdminData() {
    setLoading(true);
    const token = getWebsiteToken() || localStorage.getItem('alphavoice.website_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resStats, resUsers, resInq, resPur, resRel] = await Promise.all([
        fetch(getWebsiteApiUrl('/api/website/admin/stats'), { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(getWebsiteApiUrl('/api/website/admin/users'), { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(getWebsiteApiUrl('/api/website/admin/inquiries'), { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(getWebsiteApiUrl('/api/website/admin/purchases'), { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(getWebsiteApiUrl('/api/website/admin/releases'), { headers }).then((r) => (r.ok ? r.json() : [])),
      ]);

      if (resStats) setStats(resStats);
      if (resUsers) setUsers(resUsers);
      if (resInq) setInquiries(resInq);
      if (resPur) setPurchases(resPur);
      if (resRel) setReleases(resRel);
    } catch {
      // Failed to load
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateInquiryStatus(id: string, newStatus: string) {
    const token = getWebsiteToken() || localStorage.getItem('alphavoice.website_token');
    await fetch(getWebsiteApiUrl(`/api/website/admin/inquiries/${id}?status=${newStatus}`), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    void loadAdminData();
  }

  async function handlePublishRelease(e: React.FormEvent) {
    e.preventDefault();
    const token = getWebsiteToken() || localStorage.getItem('alphavoice.website_token');
    setRelPublishFeedback(null);

    try {
      const res = await fetch(getWebsiteApiUrl('/api/website/admin/releases'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          version: relVersion,
          release_date: relDate,
          windows_url: relWinUrl,
          macos_url: relMacUrl,
          linux_url: relLinUrl,
          changelog_markdown: relChangelog,
          is_latest: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to publish release');
      setRelPublishFeedback('✓ Release published successfully as latest!');
      void loadAdminData();
    } catch (err: unknown) {
      setRelPublishFeedback(err instanceof Error ? err.message : 'Error publishing release');
    }
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <ShieldAlertIcon className="size-10 text-destructive mx-auto" />
        <h2 className="mt-4 text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="mt-1 text-xs text-muted-foreground">Admin credentials required to view this panel.</p>
        <Link to="/" className="mt-4 inline-block text-xs font-semibold text-primary underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Top Header */}
      <div className="website-card rounded-3xl p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
            <ShieldCheckIcon className="size-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Admin Management Console</h1>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                Staff
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Connected to local SQLite database omnivoice.db & FastAPI backend.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadAdminData}
          disabled={loading}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCwIcon className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {[
          { id: 'stats' as const, label: 'Analytics & Overview', icon: ZapIcon },
          { id: 'users' as const, label: 'Customer Accounts', icon: UsersIcon, count: users.length },
          { id: 'inquiries' as const, label: 'Support Inquiries', icon: MessageSquareIcon, count: inquiries.length },
          { id: 'releases' as const, label: 'Releases & Downloads', icon: DownloadIcon, count: releases.length },
          { id: 'purchases' as const, label: 'Purchases & Revenue', icon: UserCheckIcon, count: purchases.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-card/70 border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? 'bg-black/30' : 'bg-muted'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* STATS OVERVIEW */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="website-card rounded-2xl p-5 text-center">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">Customers</span>
              <div className="mt-2 text-3xl font-extrabold text-foreground">{stats.total_users}</div>
            </div>
            <div className="website-card rounded-2xl p-5 text-center">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">Active Subs</span>
              <div className="mt-2 text-3xl font-extrabold text-emerald-400">{stats.active_subscriptions}</div>
            </div>
            <div className="website-card rounded-2xl p-5 text-center">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">Total Revenue</span>
              <div className="mt-2 text-3xl font-extrabold text-primary">${stats.total_revenue_usd}</div>
            </div>
            <div className="website-card rounded-2xl p-5 text-center">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">Total Downloads</span>
              <div className="mt-2 text-3xl font-extrabold text-foreground">{stats.total_downloads}</div>
            </div>
            <div className="website-card rounded-2xl p-5 text-center">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">Pending Inquiries</span>
              <div className="mt-2 text-3xl font-extrabold text-amber-400">{stats.pending_inquiries}</div>
            </div>
          </div>
        </div>
      )}

      {/* USERS MANAGER */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Registered Customers & Subscribers</h2>
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 font-bold text-foreground">
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Active Plan</th>
                  <th className="p-3.5">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="p-3.5 font-bold text-foreground">{u.full_name}</td>
                    <td className="p-3.5 text-muted-foreground">{u.email}</td>
                    <td className="p-3.5 text-muted-foreground">{u.company || '—'}</td>
                    <td className="p-3.5">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {u.plan_name || 'Community Free'}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{new Date(u.created_at * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INQUIRIES INBOX */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Customer Support & Contact Messages</h2>
          {inquiries.length === 0 ? (
            <div className="website-card rounded-2xl p-8 text-center text-xs text-muted-foreground">
              No inquiries received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="website-card rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{inq.subject}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            inq.status === 'resolved'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : inq.status === 'in_progress'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-primary/15 text-primary'
                          }`}
                        >
                          {inq.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        From <strong>{inq.name}</strong> ({inq.email}) · {new Date(inq.created_at * 1000).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateInquiryStatus(inq.id, 'in_progress')}
                        className="h-7 text-[11px]"
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateInquiryStatus(inq.id, 'resolved')}
                        className="h-7 text-[11px] text-emerald-400"
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-background/50 p-3.5 text-xs text-foreground/90 whitespace-pre-line">
                    {inq.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RELEASES MANAGER */}
      {activeTab === 'releases' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* New Release Form */}
          <form onSubmit={handlePublishRelease} className="website-card rounded-2xl p-6 lg:col-span-5 space-y-3.5">
            <h3 className="text-sm font-bold text-foreground">Publish / Update Software Release</h3>
            {relPublishFeedback && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-xs text-primary">
                {relPublishFeedback}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Version</label>
              <Input
                value={relVersion}
                onChange={(e) => setRelVersion(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Release Date</label>
              <Input
                value={relDate}
                onChange={(e) => setRelDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Windows Installer URL</label>
              <Input
                value={relWinUrl}
                onChange={(e) => setRelWinUrl(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">macOS DMG URL</label>
              <Input
                value={relMacUrl}
                onChange={(e) => setRelMacUrl(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Linux AppImage URL</label>
              <Input
                value={relLinUrl}
                onChange={(e) => setRelLinUrl(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Changelog Markdown</label>
              <Textarea
                rows={4}
                value={relChangelog}
                onChange={(e) => setRelChangelog(e.target.value)}
                className="text-xs font-mono resize-none"
              />
            </div>

            <Button type="submit" className="h-9 w-full text-xs font-semibold">
              Publish Release as Latest
            </Button>
          </form>

          {/* Published Releases List */}
          <div className="space-y-4 lg:col-span-7">
            <h3 className="text-sm font-bold text-foreground">Published Software Releases</h3>
            <div className="space-y-3">
              {releases.map((r) => (
                <div key={r.id} className="website-card rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground font-mono">v{r.version}</span>
                      {r.is_latest === 1 && (
                        <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                          Latest Public
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{r.release_date}</span>
                  </div>
                  <div className="rounded border border-border/40 bg-black/40 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-line">
                    {r.changelog_markdown}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PURCHASES */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Customer Purchases & Commercial License Issuances</h2>
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 font-bold text-foreground">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Customer Email</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="p-3.5 font-mono font-bold text-foreground">{p.invoice_number}</td>
                    <td className="p-3.5 text-muted-foreground">{p.user_email}</td>
                    <td className="p-3.5 font-medium text-foreground">{p.plan_name}</td>
                    <td className="p-3.5 font-bold text-foreground">${p.amount} {p.currency}</td>
                    <td className="p-3.5 uppercase text-muted-foreground">{p.payment_method}</td>
                    <td className="p-3.5">
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{new Date(p.created_at * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
