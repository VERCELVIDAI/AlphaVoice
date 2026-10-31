export function joinApiPath(base: string, path: string): string {
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Vite's `/api` is a transport prefix except for backend routers that
 * canonically own it. Electron main applies the same one-prefix rule. */
export function rewriteDevApiProxyPath(path: string): string {
  return /^\/api\/(settings|auth|integrations|mcp|website)(?:\/|$)/.test(path)
    ? path
    : path.replace(/^\/api/, '');
}

/** Canonical list of public website routes that render in the SaaS website layout
 * without requiring the desktop backend engine or app shell. */
export const PUBLIC_WEBSITE_ROUTES = [
  '/website',
  '/features',
  '/pricing',
  '/download',
  '/docs',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/refund-policy',
  '/delivery-policy',
  '/license-agreement',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/account',
  '/admin/website',
] as const;

/** Extended routes exempt from local backend/token authentication gates */
export const AUTH_EXEMPT_ROUTES = [
  ...PUBLIC_WEBSITE_ROUTES,
  '/portal',
  '/store',
  '/pro',
] as const;

export function isPublicWebsitePath(pathname: string, isWebDeployment = false): boolean {
  if (pathname === '/' || pathname === '/index.html') {
    return isWebDeployment;
  }
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  return PUBLIC_WEBSITE_ROUTES.some(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`),
  );
}

export function isAuthExemptPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/index.html') {
    return true;
  }
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  return AUTH_EXEMPT_ROUTES.some(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`),
  );
}

