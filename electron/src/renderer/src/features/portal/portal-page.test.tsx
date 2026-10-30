import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

vi.mock('@/components/app-shell/workspace-header', () => ({
  WorkspaceHeader: ({ children }: { children: ReactNode }) => <header>{children}</header>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { PortalPage } from './portal-page';

afterEach(cleanup);

it('renders the AlphaVoice storefront hero, download hub, and pricing', () => {
  render(<PortalPage />);

  // Verify Header & Hero
  expect(screen.getByRole('heading', { level: 1, name: /AlphaVoice Studio Store & Portal/ })).toBeInTheDocument();
  expect(screen.getByText(/The Independent, Local-First AI Voice Platform/)).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: /Sovereign Voice AI/ })).toBeInTheDocument();

  // Verify Download Section
  expect(screen.getByRole('heading', { level: 3, name: /Download AlphaVoice Studio/ })).toBeInTheDocument();
  expect(screen.getByText(/Windows 10 \/ 11 \(64-bit\)/)).toBeInTheDocument();
  expect(screen.getByText(/Apple Silicon \(M1–M4\) & Intel/)).toBeInTheDocument();
  expect(screen.getByText(/Ubuntu, Debian, Fedora, Arch/)).toBeInTheDocument();

  // Verify Quickstart Commands
  expect(screen.getByText('irm https://alphavoice.studio/install.ps1 | iex')).toBeInTheDocument();
  expect(screen.getByText('curl -fsSL https://alphavoice.studio/install | sh')).toBeInTheDocument();

  // Verify Pricing Cards
  expect(screen.getByRole('heading', { level: 4, name: 'Community Free' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 4, name: 'Pro Annual' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 4, name: 'Pro Lifetime' })).toBeInTheDocument();
  expect(screen.getByText('$299')).toBeInTheDocument();

  // Verify License Key Management
  expect(screen.getByRole('heading', { level: 4, name: 'License Key Management' })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Paste license key/)).toBeInTheDocument();
});
