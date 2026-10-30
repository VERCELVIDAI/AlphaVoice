import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  CopyIcon,
  DownloadIcon,
  KeyIcon,
  LockIcon,
  LogOutIcon,
  ReceiptIcon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  fetchCustomerData,
  getWebsiteApiUrl,
  getWebsiteToken,
  useWebsiteAuth,
  type CustomerDashboardData,
} from '@/lib/store/website-auth-store';

export function WebsiteAccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useWebsiteAuth();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'licenses' | 'invoices' | 'downloads' | 'settings'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Profile update form
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/login' });
      return;
    }

    void fetchCustomerData().then((dash) => {
      if (dash) {
        setData(dash);
        setFullName(dash.user.full_name);
        setCompany(dash.user.company || '');
      }
    });
  }, [isAuthenticated, navigate]);

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleDownloadCert(lic: CustomerDashboardData['licenses'][0]) {
    const cert = JSON.stringify(
      {
        license_key: lic.license_key,
        plan_id: lic.plan_id,
        seats: lic.seats,
        status: lic.status,
        issued_to: data?.user.full_name,
        email: data?.user.email,
        company: data?.user.company,
        issued_at: new Date(lic.issued_at * 1000).toISOString(),
        expires_at: lic.expires_at ? new Date(lic.expires_at * 1000).toISOString() : null,
      },
      null,
      2,
    );
    const blob = new Blob([cert], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AlphaVoice-License-${lic.license_key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileFeedback(null);

    const token = getWebsiteToken() || localStorage.getItem('alphavoice.website_token');
    try {
      const res = await fetch(getWebsiteApiUrl('/api/website/customer/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          company,
          new_password: newPassword || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.detail || 'Update failed');
      setProfileFeedback('✓ Profile updated successfully.');
      setNewPassword('');
    } catch (err: unknown) {
      setProfileFeedback(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setProfileSaving(false);
    }
  }

  if (!user) return null;

  const activeSub = data?.subscription;
  const licenses = data?.licenses || [];
  const purchases = data?.purchases || [];
  const downloads = data?.downloads || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Customer Header Banner */}
      <div className="website-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/20 text-xl font-bold text-primary">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{user.full_name}</h1>
              {user.role === 'admin' && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.company && <p className="text-xs text-muted-foreground">{user.company}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/pricing"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow"
          >
            <SparklesIcon className="size-3.5" />
            {activeSub ? 'Manage Plan' : 'Upgrade to Pro'}
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              void navigate({ to: '/' });
            }}
            className="h-9 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
          >
            <LogOutIcon className="size-3.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {[
          { id: 'overview' as const, label: 'Overview', icon: UserIcon },
          { id: 'licenses' as const, label: 'Licenses & Keys', icon: KeyIcon, count: licenses.length },
          { id: 'invoices' as const, label: 'Billing & Invoices', icon: ReceiptIcon, count: purchases.length },
          { id: 'downloads' as const, label: 'Download Log', icon: DownloadIcon, count: downloads.length },
          { id: 'settings' as const, label: 'Account Settings', icon: LockIcon },
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
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? 'bg-black/30' : 'bg-muted'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Active Subscription Card */}
            <div className="website-card rounded-2xl p-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Current Subscription
              </span>
              <div className="mt-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  {activeSub ? activeSub.plan_name : 'Community Free Tier'}
                </h3>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {activeSub ? 'Active' : 'Free Core'}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {activeSub
                  ? `Billing cycle: ${activeSub.billing_cycle}`
                  : 'Unlimited on-device generation with core neural engines.'}
              </p>
              <div className="mt-4 pt-4 border-t border-border/40">
                <Link to="/pricing" className="text-xs font-semibold text-primary hover:underline">
                  {activeSub ? 'Change Subscription Plan &rarr;' : 'Upgrade to Pro License &rarr;'}
                </Link>
              </div>
            </div>

            {/* Total Licenses Card */}
            <div className="website-card rounded-2xl p-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Active License Keys
              </span>
              <div className="mt-3 text-3xl font-extrabold text-foreground">{licenses.length}</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Cryptographically signed offline keys bound to your account.
              </p>
              <div className="mt-4 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setActiveTab('licenses')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View License Keys &rarr;
                </button>
              </div>
            </div>

            {/* Quick Download Card */}
            <div className="website-card rounded-2xl p-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Latest Software Release
              </span>
              <div className="mt-3 text-lg font-bold text-foreground">AlphaVoice v0.1.0</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Production release with 40+ engines and local WhisperX dictation.
              </p>
              <div className="mt-4 pt-4 border-t border-border/40">
                <Link to="/download" className="text-xs font-semibold text-primary hover:underline">
                  Download Native Installer &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LICENSES TAB */}
      {activeTab === 'licenses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Your Commercial License Keys</h2>
              <p className="text-xs text-muted-foreground">
                These offline cryptographic keys unlock Pro and Lifetime features without internet connectivity.
              </p>
            </div>
            <Link
              to="/pricing"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
            >
              Purchase Additional Key
            </Link>
          </div>

          {licenses.length === 0 ? (
            <div className="website-card rounded-2xl p-8 text-center space-y-3">
              <KeyIcon className="size-8 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">No Commercial Licenses Assigned Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You are currently on the Community Free Tier. Upgrade to Pro Annual or Lifetime to receive your official commercial license.
              </p>
              <Link
                to="/pricing"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground"
              >
                View Plans & Pricing
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {licenses.map((lic) => (
                <div key={lic.id} className="website-card rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">AlphaVoice Pro Commercial License</span>
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          {lic.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Seats: {lic.seats} · Issued on {new Date(lic.issued_at * 1000).toLocaleDateString()} ·{' '}
                        {lic.expires_at ? `Expires ${new Date(lic.expires_at * 1000).toLocaleDateString()}` : 'Perpetual Lifetime'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadCert(lic)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <DownloadIcon className="size-3.5" />
                        Download Certificate (.json)
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/80 bg-black/50 p-3 font-mono text-sm font-bold text-foreground">
                    <span>{lic.license_key}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(lic.license_key)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <CopyIcon className="size-3.5" />
                      {copiedKey === lic.license_key ? 'Copied!' : 'Copy Key'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Billing & Invoice History</h2>
            <p className="text-xs text-muted-foreground">Download receipts and tax invoices for your purchases.</p>
          </div>

          {purchases.length === 0 ? (
            <div className="website-card rounded-2xl p-8 text-center text-xs text-muted-foreground">
              No purchases recorded for this account.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 font-bold text-foreground">
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Plan / Description</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-muted/10">
                      <td className="p-3.5 font-mono font-bold text-foreground">{p.invoice_number}</td>
                      <td className="p-3.5 font-medium text-foreground">{p.plan_name}</td>
                      <td className="p-3.5 text-muted-foreground">{new Date(p.created_at * 1000).toLocaleDateString()}</td>
                      <td className="p-3.5 font-bold text-foreground">${p.amount} {p.currency}</td>
                      <td className="p-3.5">
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DOWNLOADS TAB */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Your Recorded Download History</h2>
            <p className="text-xs text-muted-foreground">Software installer downloads logged for your account.</p>
          </div>

          {downloads.length === 0 ? (
            <div className="website-card rounded-2xl p-8 text-center text-xs text-muted-foreground">
              No download records found. Visit the Download Center to get the latest release.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 font-bold text-foreground">
                    <th className="p-3.5">Platform</th>
                    <th className="p-3.5">Version</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((d) => (
                    <tr key={d.id} className="border-b border-border/30 hover:bg-muted/10">
                      <td className="p-3.5 font-bold uppercase text-foreground">{d.os_platform}</td>
                      <td className="p-3.5 font-mono text-muted-foreground">v{d.version}</td>
                      <td className="p-3.5 text-muted-foreground">{new Date(d.downloaded_at * 1000).toLocaleString()}</td>
                      <td className="p-3.5">
                        <Link to="/download" className="text-xs font-semibold text-primary hover:underline">
                          Re-Download &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Profile & Account Settings</h2>
            <p className="text-xs text-muted-foreground">Update your contact information and change your account password.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="website-card rounded-2xl p-6 space-y-4">
            {profileFeedback && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs font-medium text-foreground">
                {profileFeedback}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Full Name
              </label>
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Account Email
              </label>
              <Input
                disabled
                value={user.email}
                className="h-9 text-xs bg-muted/40 cursor-not-allowed text-muted-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Company / Organization
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="pt-2 border-t border-border/40">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                New Password (leave blank to keep unchanged)
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={profileSaving}
              className="h-9 w-full text-xs font-semibold"
            >
              {profileSaving ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
