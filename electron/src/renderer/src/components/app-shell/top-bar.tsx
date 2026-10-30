import { AudioLinesIcon, SparklesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { appVersion, isMac } from '../bridge';
import { ThemeToggle } from './theme-toggle';

/**
 * Frameless-window title bar. Windows/Linux draw their own caption buttons via
 * `titleBarOverlay` on the right (~140px), macOS its traffic lights on the left
 * (~80px); the padding keeps our content out from under either.
 */
export function TopBar() {
  const { t } = useTranslation();
  const mac = isMac();
  return (
    <header
      className={cn(
        'app-drag flex h-9 shrink-0 items-center gap-3 border-b bg-(--toolbar-background) px-3 text-sidebar-foreground select-none',
        mac ? 'pl-20' : 'pr-[140px]',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <AudioLinesIcon className="size-4 text-primary" aria-hidden="true" />
        <span className="text-[13px] font-semibold tracking-tight">{t('app.name')}</span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {t('app.version', { version: appVersion() })}
        </span>
      </div>
      <span className="hidden min-w-0 flex-1 truncate text-[11px] text-muted-foreground sm:block">
        {t('app.tagline')}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/portal"
          className="no-drag inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary transition hover:bg-primary/20 hover:border-primary/50"
        >
          <SparklesIcon className="size-3" />
          <span>Download & Pricing</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
