import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from 'lucide-react';
import { brandIcon } from '@/lib/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getWebsiteApiUrl, setWebsiteSession, useWebsiteAuth } from '@/lib/store/website-auth-store';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
}

export function WebsiteAuthPage({ initialMode = 'login' }: AuthPageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useWebsiteAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already authenticated, allow jumping straight to account
  if (isAuthenticated && mode !== 'reset') {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <div className="website-card rounded-3xl p-8 space-y-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary mx-auto">
            <CheckCircle2Icon className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">You are already signed in</h2>
          <p className="text-xs text-muted-foreground">Manage your licenses, downloads, and billing settings.</p>
          <div className="pt-2">
            <Link
              to="/account"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-xs font-semibold text-primary-foreground"
            >
              Go to Customer Portal &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(getWebsiteApiUrl('/api/website/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || 'Invalid email or password. Please try again.');
      }

      setWebsiteSession(data.token, data.user);
      await navigate({ to: '/account' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setErrorMsg('Unable to connect to AlphaVoice backend service. Please verify your connection.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanCompany = company.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (cleanName.length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(getWebsiteApiUrl('/api/website/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          full_name: cleanName,
          company: cleanCompany,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || 'Registration failed');
      }

      setWebsiteSession(data.token, data.user);
      await navigate({ to: '/account' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setErrorMsg('Unable to connect to AlphaVoice backend service. Please verify your connection.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(getWebsiteApiUrl('/api/website/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || 'Request failed');
      }

      setSuccessMsg(data?.message || 'Password reset link sent.');
      if (data?.debug_reset_token) {
        setResetToken(data.debug_reset_token);
        setMode('reset');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const cleanToken = resetToken.trim();
    if (!cleanToken) {
      setErrorMsg('Reset token is required.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(getWebsiteApiUrl('/api/website/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken, new_password: newPassword }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'Reset failed');
      setSuccessMsg('Your password has been successfully updated. Please sign in with your new password.');
      setPassword('');
      setMode('login');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <div className="website-card rounded-3xl p-8 shadow-2xl">
        {/* Top Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={brandIcon} alt="" className="size-7" />
            <span className="text-lg font-bold text-foreground">AlphaVoice Studio</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            {mode === 'login'
              ? 'Sign in to Your Account'
              : mode === 'register'
                ? 'Create Customer Account'
                : mode === 'forgot'
                  ? 'Reset Your Password'
                  : 'Enter New Password'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === 'login'
              ? 'Access your commercial licenses, invoices, and downloads.'
              : mode === 'register'
                ? 'Register to manage licenses and cloud synchronization.'
                : 'Enter your account email to receive reset instructions.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400">
            {successMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setMode('forgot');
                  }}
                  className="text-[11px] text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full gap-2 text-xs font-semibold shadow-md shadow-primary/20"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRightIcon className="size-3.5" />
            </Button>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('register');
                }}
                className="font-semibold text-primary hover:underline"
              >
                Register now
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  required
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Company / Organization (Optional)
              </label>
              <Input
                placeholder="Studio or Agency"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full gap-2 text-xs font-semibold shadow-md shadow-primary/20"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRightIcon className="size-3.5" />
            </Button>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Account Email
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full text-xs font-semibold"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="text-xs text-primary hover:underline"
              >
                &larr; Back to sign in
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {mode === 'reset' && (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Reset Token
              </label>
              <Input
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="h-9 font-mono text-xs"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                New Password (min. 6 characters)
              </label>
              <div className="relative">
                <Input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full text-xs font-semibold"
            >
              {loading ? 'Updating Password...' : 'Set New Password'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="text-xs text-primary hover:underline"
              >
                &larr; Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
