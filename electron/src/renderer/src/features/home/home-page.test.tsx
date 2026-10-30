import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
const browser = vi.hoisted(() => ({ open: vi.fn(async () => {}) }));
const files = vi.hoisted(() => ({ openExternal: vi.fn(async () => {}) }));
vi.mock('@/components/bridge', () => ({
  getBridge: () => ({ browser, files }),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));
vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQuery: () => ({ data: [] }),
}));
vi.mock('@/hooks/use-profiles', () => ({ useProfiles: () => ({ data: [] }) }));
vi.mock('@/components/app-shell/workspace-header', () => ({
  WorkspaceHeader: ({ children }: { children: ReactNode }) => <header>{children}</header>,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
import { HomePage } from './home-page';
import { homeContributors } from './home-contributors-data';
import en from '@/i18n/locales/en.json';

afterEach(cleanup);

it('keeps the heading and description together beside the contributor artwork', () => {
  render(<HomePage />);
  const heading = screen.getByRole('heading', { name: 'homeUi.title' });
  const description = screen.getByText('homeUi.subtitle');
  const copy = heading.parentElement!;
  expect(copy).toContainElement(description);
  expect(copy.querySelector('.home-contributors')).toBeNull();
  expect(copy.nextElementSibling).toHaveClass('home-contributors');
});

it('previews the official website only when the title is clicked', () => {
  browser.open.mockClear();
  render(<HomePage />);
  const title = screen.getByRole('link', { name: 'homeUi.title' });
  expect(en.homeUi.title).toBe('VoiceStudio.sh Open Source');
  expect(title).toHaveAttribute('href', 'https://voicestudio.sh');
  fireEvent.mouseEnter(title);
  expect(browser.open).not.toHaveBeenCalled();
  fireEvent.click(title);
  expect(browser.open).toHaveBeenCalledWith('https://voicestudio.sh');
});

it('names the feature Dubbing consistently while preserving the existing route', () => {
  expect(en.dubWorkspace.title).toBe('Dubbing');
  expect(en.nav.dub).toBe('Dubbing');
  expect(en.keyboard.dub).toBe('Dubbing');
  render(<HomePage />);
  expect(screen.getByRole('link', { name: /dubWorkspace.title/ })).toHaveAttribute('href', '/dub');
});

it('credits qualifying contributors and opens their GitHub profiles externally', () => {
  render(<HomePage />);
  const credits = screen.getAllByRole('listitem');
  expect(
    Array.from(document.querySelectorAll('[data-core-maintainer]'), (badge) =>
      badge.getAttribute('data-core-maintainer'),
    ),
  ).toEqual(['debpalash', 'velixio']);
  expect(credits).toHaveLength(homeContributors.length + 1);
  expect(Array.from(document.querySelectorAll('.home-contributors-core li img')).length).toBe(2);
  expect(document.querySelectorAll('.home-contributors-rest li')).toHaveLength(
    homeContributors.length - 2 + 1,
  );
  expect(homeContributors.every((person) => person.commits > 10)).toBe(true);
  const all = screen.getByRole('link', { name: 'homeUi.allContributors' });
  expect(all).toHaveAttribute(
    'href',
    'https://github.com/alphavoice/AlphaVoice/graphs/contributors',
  );
  fireEvent.click(all);
  expect(files.openExternal).toHaveBeenCalledWith(
    'https://github.com/alphavoice/AlphaVoice/graphs/contributors',
  );
  for (const { login } of homeContributors) {
    if (login === 'debpalash' || login === 'velixio') continue;
    const profile = screen.getByRole('link', { name: `GitHub · @${login}` });
    expect(profile).toHaveAttribute('href', `https://github.com/${login}`);
    expect(profile.querySelector('img')?.src).not.toMatch(/^https?:\/\/(avatars|github)/);
    fireEvent.click(profile);
    expect(files.openExternal).toHaveBeenCalledWith(`https://github.com/${login}`);
  }
});

it('opens both creator profiles from the accessible avatar card', async () => {
  render(<HomePage />);
  fireEvent.click(screen.getByRole('button', { name: '@debpalash' }));
  const github = await screen.findByRole('link', { name: 'GitHub @debpalash' });
  const x = screen.getByRole('link', { name: 'X @idebpalash' });
  expect(screen.getByRole('link', { name: 'homeUi.website palash.dev' })).toHaveAttribute(
    'href',
    'https://alphavoice.studio',
  );
  expect(screen.getByText('homeUi.creatorCoreTeam')).toBeVisible();
  expect(screen.getByText('homeUi.maintainerPalash')).toBeVisible();
  expect(screen.getAllByText('homeUi.follow')).toHaveLength(2);
  expect(github).toHaveAttribute('href', 'https://github.com/debpalash');
  expect(x).toHaveAttribute('href', 'https://x.com/alphavoicestudio');
  fireEvent.click(github);
  expect(files.openExternal).toHaveBeenCalledWith('https://github.com/debpalash');
  fireEvent.click(x);
  expect(files.openExternal).toHaveBeenCalledWith('https://x.com/alphavoicestudio');
});

it('gives velixio the same hover card as the creator', async () => {
  render(<HomePage />);
  fireEvent.click(screen.getByRole('button', { name: '@velixio' }));
  const github = await screen.findByRole('link', { name: 'GitHub @velixio' });
  expect(github).toHaveAttribute('href', 'https://github.com/velixio');
  expect(screen.getByText('homeUi.maintainerShimul')).toBeVisible();
  expect(screen.getByRole('link', { name: 'homeUi.website shimul.me' })).toHaveAttribute(
    'href',
    'https://shimul.me',
  );
  expect(screen.getAllByText('homeUi.follow')).toHaveLength(2);
  const x = screen.getByRole('link', { name: 'X @shimuldn' });
  expect(x).toHaveAttribute('href', 'https://x.com/shimuldn');
});

it('separates three primary creation actions and describes all nine destinations', () => {
  render(<HomePage />);
  const primary = document.querySelector('.home-destinations--primary')!;
  const secondary = document.querySelector('.home-destinations--secondary')!;
  expect(primary).not.toBeNull();
  expect(secondary).not.toBeNull();
  expect(primary.querySelectorAll('.home-destination')).toHaveLength(3);
  expect(secondary.querySelectorAll('.home-destination')).toHaveLength(6);
  expect(screen.getByRole('link', { name: /nav.clone/ })).toHaveAttribute('href', '/clone');
  expect(screen.getByRole('link', { name: /designWorkspace.title/ })).toHaveAttribute(
    'href',
    '/design',
  );
  expect(screen.getByRole('link', { name: /dubWorkspace.title/ })).toHaveAttribute('href', '/dub');
});
