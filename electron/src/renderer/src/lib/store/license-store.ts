import { useEffect, useState } from 'react';

export interface CommercialLicense {
  key: string;
  plan: 'pro_yearly' | 'pro_lifetime' | 'enterprise';
  planName: string;
  seats: number;
  customerName: string;
  customerEmail: string;
  companyName?: string;
  issuedAt: string;
  expiresAt: string | null;
  status: 'active' | 'expired' | 'revoked';
  signature: string;
  features: string[];
}

const STORAGE_KEY = 'alphavoice.commercial_license';
const EVENT_NAME = 'alphavoice:license_changed';

/** Generate a realistic, cryptographically styled commercial license key */
export function generateLicenseKey(plan: 'yearly' | 'lifetime' | 'enterprise'): string {
  const prefix =
    plan === 'lifetime'
      ? 'ALPHA-LIFE'
      : plan === 'enterprise'
        ? 'ALPHA-ENT'
        : 'ALPHA-PRO';
  const year = new Date().getFullYear();
  const randBlock = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${year}-${randBlock()}-${randBlock()}-${randBlock()}`;
}

/** Read current active license from localStorage */
export function getActiveLicense(): CommercialLicense | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const license = JSON.parse(raw) as CommercialLicense;
    if (license.expiresAt && new Date(license.expiresAt).getTime() < Date.now()) {
      license.status = 'expired';
    }
    return license;
  } catch {
    return null;
  }
}

/** Save and activate license */
export function saveActiveLicense(license: CommercialLicense): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: license }));
}

/** Clear / deactivate license */
export function removeActiveLicense(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }));
}

/** Hook for listening to active license state */
export function useCommercialLicense() {
  const [license, setLicense] = useState<CommercialLicense | null>(() => getActiveLicense());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CommercialLicense | null>).detail;
      setLicense(detail ?? getActiveLicense());
    };
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const isProActive = Boolean(license && license.status === 'active');

  return {
    license,
    isProActive,
    activate: saveActiveLicense,
    deactivate: removeActiveLicense,
    refresh: () => setLicense(getActiveLicense()),
  };
}
