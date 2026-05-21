'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Home, BookOpen, FolderOpen, GitBranch, Wrench, Library,
  LayoutDashboard, Settings, Search,
  Monitor, Newspaper, Sun, ArrowRight, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Kbd } from '@/components/ui/kbd';
import { useUIStore } from '@/lib/store';
import { usePreferences } from '@/lib/store/preferences-store';
import { useEmit } from '@/lib/event-bus';
import { MODULE_SPINE } from '@/lib/content/modules';
import { TOOLS } from '@/lib/content/tools';
import { FRAMEWORK_SPINE } from '@/lib/content/frameworks';

/**
 * Command palette — cmdk-driven.
 *
 * Groups:
 *   Jump to ...    (top-level routes)
 *   Modules        (12)
 *   Cases          (search-only)
 *   Tools          (9)
 *   Frameworks     (13)
 *   Theme          (3 + cycle)
 *   Density        (3)
 *
 * Type to fuzzy-filter. Enter to execute. ESC to close.
 * Mounts a Radix Dialog overlay so ESC + click-outside work for free.
 */

const SECTIONS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/modules', label: 'Modules', icon: BookOpen, kbd: 'g m' },
  { href: '/cases', label: 'Cases', icon: FolderOpen, kbd: 'g c' },
  { href: '/map', label: 'Case Map', icon: GitBranch, kbd: 'g x' },
  { href: '/tools', label: 'Tools', icon: Wrench, kbd: 'g t' },
  { href: '/resources', label: 'Resources', icon: Library, kbd: 'g r' },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, kbd: 'g d' },
  { href: '/search', label: 'Search', icon: Search, kbd: '⌘ K' },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const THEME_ITEMS = [
  { id: 'terminal', label: 'Terminal theme', icon: Monitor },
  { id: 'boardroom', label: 'Boardroom theme', icon: Newspaper },
  { id: 'daylight', label: 'Daylight theme', icon: Sun },
] as const;

const DENSITY_ITEMS = [
  { id: 'comfortable', label: 'Density · Comfortable' },
  { id: 'compact', label: 'Density · Compact' },
  { id: 'dense', label: 'Density · Dense' },
] as const;

export function CommandPalette() {
  const open = useUIStore((s) => s.paletteOpen);
  const setClose = useUIStore((s) => s.closePalette);
  const router = useRouter();
  const setTheme = usePreferences((s) => s.setTheme);
  const setDensity = usePreferences((s) => s.setDensity);
  const emit = useEmit();
  const [search, setSearch] = React.useState('');

  // Reset search when opened
  React.useEffect(() => {
    if (open) setSearch('');
  }, [open]);

  function go(href: string, label: string) {
    setClose();
    void emit('palette.action', { action: 'navigate', target: href });
    // Defer router push so the palette has time to close
    setTimeout(() => router.push(href), 0);
    void { label };
  }

  function applyTheme(id: 'terminal' | 'boardroom' | 'daylight') {
    setTheme(id);
    void emit('theme.changed', { theme: id });
    setClose();
  }

  function applyDensity(id: 'comfortable' | 'compact' | 'dense') {
    setDensity(id);
    void emit('density.changed', { density: id });
    setClose();
  }

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-palette',
        'flex items-start justify-center pt-[12vh] px-4',
        'animate-in fade-in duration-fast',
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) setClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" aria-hidden />

      {/* Palette card */}
      <div
        className={cn(
          'relative w-full max-w-xl',
          'rounded-md border border-line bg-bg-elevated shadow-overlay',
          'overflow-hidden',
          'animate-in fade-in zoom-in-95 duration-base ease-out-custom',
        )}
        role="dialog"
        aria-label="Command palette"
      >
        <Command
          label="Command palette"
          shouldFilter
          className="flex flex-col max-h-[60vh]"
        >
          <div className="flex items-center gap-2 px-3 border-b border-line">
            <Search size={14} className="text-fg-muted shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type to search modules, cases, tools, frameworks…"
              className={cn(
                'flex-1 h-11 bg-transparent text-fg placeholder:text-fg-subtle',
                'font-body text-sm outline-none',
              )}
              autoFocus
            />
            <Kbd>ESC</Kbd>
          </div>

          <Command.List
            className="overflow-y-auto p-1.5 flex-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            <Command.Empty className="px-3 py-8 text-center text-sm text-fg-muted">
              <Sparkles size={14} className="inline mr-1 text-fg-subtle" />
              No matches. Try a different word.
            </Command.Empty>

            <Group label="Jump to">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <Item
                    key={s.href}
                    onSelect={() => go(s.href, s.label)}
                    keywords={[s.label, s.href]}
                    icon={<Icon size={13} />}
                    kbd={s.kbd}
                  >
                    {s.label}
                  </Item>
                );
              })}
            </Group>

            <Group label="Modules">
              {MODULE_SPINE.map((m) => (
                <Item
                  key={m.id}
                  value={`module ${m.id} ${m.title} ${m.tagline}`}
                  onSelect={() => go(`/modules/${m.slug}`, m.title)}
                  icon={
                    <span className="font-mono text-2xs text-fg-subtle w-6 text-right tabular-nums">
                      {m.id}
                    </span>
                  }
                >
                  <span className="flex flex-col">
                    <span>{m.title}</span>
                    <span className="text-2xs text-fg-subtle font-body normal-case tracking-normal">
                      {m.tagline}
                    </span>
                  </span>
                </Item>
              ))}
            </Group>

            <Group label="Tools">
              {TOOLS.map((t) => (
                <Item
                  key={t.slug}
                  value={`tool ${t.name} ${t.tagline}`}
                  onSelect={() => go(`/tools/${t.slug}`, t.name)}
                  icon={<Wrench size={12} className="text-fg-subtle" />}
                >
                  <span className="flex flex-col">
                    <span>{t.name}</span>
                    <span className="text-2xs text-fg-subtle font-body normal-case tracking-normal">
                      {t.tagline}
                    </span>
                  </span>
                </Item>
              ))}
            </Group>

            <Group label="Frameworks">
              {FRAMEWORK_SPINE.map((f) => (
                <Item
                  key={f.slug}
                  value={`framework ${f.name} ${f.tagline}`}
                  onSelect={() => go(`/tools/mind-map?framework=${f.slug}`, f.name)}
                  icon={<GitBranch size={12} className="text-fg-subtle" />}
                >
                  <span className="flex flex-col">
                    <span>{f.name}</span>
                    <span className="text-2xs text-fg-subtle font-body normal-case tracking-normal">
                      {f.tagline}
                    </span>
                  </span>
                </Item>
              ))}
            </Group>

            <Group label="Theme">
              {THEME_ITEMS.map((t) => {
                const Icon = t.icon;
                return (
                  <Item
                    key={t.id}
                    value={`theme ${t.label}`}
                    onSelect={() => applyTheme(t.id)}
                    icon={<Icon size={13} />}
                  >
                    {t.label}
                  </Item>
                );
              })}
            </Group>

            <Group label="Density">
              {DENSITY_ITEMS.map((d) => (
                <Item
                  key={d.id}
                  value={`density ${d.label}`}
                  onSelect={() => applyDensity(d.id)}
                  icon={
                    <span className="font-mono text-2xs text-fg-subtle">
                      ▪
                    </span>
                  }
                >
                  {d.label}
                </Item>
              ))}
            </Group>
          </Command.List>

          <div
            className={cn(
              'flex items-center justify-between gap-3 px-3 py-2',
              'border-t border-line bg-bg-panel',
              'font-mono text-2xs text-fg-subtle tracking-wider',
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd><Kbd>↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd> select
              </span>
              <span className="flex items-center gap-1">
                <Kbd>ESC</Kbd> close
              </span>
            </div>
            <span>case-arena · ⌘K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

// ---------- Helper components ----------

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={
        <span className="px-2 pt-2 pb-1 block font-mono text-2xs uppercase tracking-widest text-fg-subtle">
          {label}
        </span>
      }
      className="mb-1"
    >
      {children}
    </Command.Group>
  );
}

interface ItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  kbd?: string;
  onSelect: () => void;
  /** Override the search value cmdk uses for matching */
  value?: string;
  keywords?: string[];
}

function Item({ children, icon, kbd, onSelect, value, keywords }: ItemProps) {
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      onSelect={onSelect}
      className={cn(
        'flex items-center gap-2.5 px-2 py-1.5 rounded-sm',
        'text-sm text-fg cursor-default select-none',
        'data-[selected=true]:bg-bg-panel',
        'transition-colors duration-fast',
      )}
    >
      {icon && <span className="w-6 grid place-items-center shrink-0">{icon}</span>}
      <span className="flex-1 min-w-0 truncate">{children}</span>
      {kbd && <Kbd combo={kbd.includes(' ')}>{kbd}</Kbd>}
      <ArrowRight size={11} className="text-fg-subtle opacity-0 data-[selected=true]:opacity-100" />
    </Command.Item>
  );
}
