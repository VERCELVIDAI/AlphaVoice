import { useEffect, useState } from 'react';

export interface WebsiteUser {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  role: 'customer' | 'admin';
  created_at?: number;
}

export interface WebsiteSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: string;
  amount: number;
  status: string;
  current_period_end: number | null;
  created_at: number;
}

export interface WebsiteLicense {
  id: string;
  license_key: string;
  plan_id: string;
  seats: number;
  status: string;
  issued_at: number;
  expires_at: number | null;
}

export interface WebsitePurchase {
  id: string;
  invoice_number: string;
  plan_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: number;
}

export interface WebsiteDownloadRecord {
  id: string;
  os_platform: string;
  version: string;
  ip_address: string;
  downloaded_at: number;
}

export interface CustomerDashboardData {
  user: WebsiteUser;
  subscription: WebsiteSubscription | null;
  licenses: WebsiteLicense[];
  purchases: WebsitePurchase[];
  downloads: WebsiteDownloadRecord[];
}

export function getWebsiteApiUrl(path: string): string {
  const envBase = typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_API_BASE;
  const win = typeof window !== 'undefined' ? (window as { __OMNIVOICE_API_BASE__?: string }) : undefined;
  const base = envBase || win?.__OMNIVOICE_API_BASE__ || '';
  if (base) {
    const cleanBase = String(base).trim().replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
  return path;
}

const TOKEN_KEY = 'alphavoice.website_token';
const USER_KEY = 'alphavoice.website_user';
const EVENT_NAME = 'alphavoice:website_auth_changed';

export function getWebsiteToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCachedUser(): WebsiteUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setWebsiteSession(token: string, user: WebsiteUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { token, user } }));
}

export function clearWebsiteSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }));
}

export async function fetchCustomerData(): Promise<CustomerDashboardData | null> {
  const token = getWebsiteToken();
  if (!token) return null;

  try {
    const res = await fetch(getWebsiteApiUrl('/api/website/auth/me'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        clearWebsiteSession();
      }
      return null;
    }
    const data = await res.json();
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  } catch {
    return null;
  }
}

export function useWebsiteAuth() {
  const [user, setUser] = useState<WebsiteUser | null>(() => getCachedUser());
  const [token, setToken] = useState<string | null>(() => getWebsiteToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ token: string; user: WebsiteUser } | null>).detail;
      if (detail) {
        setUser(detail.user);
        setToken(detail.token);
      } else {
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    // Initial verify
    if (getWebsiteToken()) {
      void fetchCustomerData().then((data) => {
        if (data?.user) setUser(data.user);
      });
    }

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    logout: () => {
      clearWebsiteSession();
      setUser(null);
      setToken(null);
    },
    refresh: async () => {
      setLoading(true);
      const data = await fetchCustomerData();
      if (data?.user) setUser(data.user);
      setLoading(false);
      return data;
    },
    loading,
  };
}
