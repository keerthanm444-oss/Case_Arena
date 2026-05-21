'use client';

import * as React from 'react';
import { Palette, Monitor, Newspaper, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { usePreferences, type ThemeId, type Density } from '@/lib/store/preferences-store';
import { SimpleTooltip } from '@/components/ui/tooltip';
import { useEmit } from '@/lib/event-bus';

const THEMES: Array<{
  id: ThemeId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: 'terminal', label: 'Terminal', description: 'Near-black, amber accent', icon: Monitor },
  { id: 'boardroom', label: 'Boardroom', description: 'Navy + ivory + brass', icon: Newspaper },
  { id: 'daylight', label: 'Daylight', description: 'Warm off-white, terracotta', icon: Sun },
];

const DENSITIES: Array<{ id: Density; label: string }> = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
  { id: 'dense', label: 'Dense' },
];

/**
 * ThemeSwitcher — appears in the Topbar.
 *
 * Compound menu: theme (top), density (bottom). Each click immediately
 * applies the change via the preferences store (which also writes to the
 * <html> data attributes that drive the CSS variables).
 */

export function ThemeSwitcher() {
  const theme = usePreferences((s) => s.theme);
  const density = usePreferences((s) => s.density);
  const setTheme = usePreferences((s) => s.setTheme);
  const setDensity = usePreferences((s) => s.setDensity);
  const emit = useEmit();

  return (
    <DropdownMenu>
      <SimpleTooltip content="Appearance" side="bottom">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-7 h-7 grid place-items-center rounded-md border border-line bg-bg-elevated text-fg-muted hover:text-fg hover:border-line-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label="Appearance settings"
          >
            <Palette size={13} />
          </button>
        </DropdownMenuTrigger>
      </SimpleTooltip>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => {
            setTheme(v as ThemeId);
            emit('theme.changed', { theme: v as ThemeId });
          }}
        >
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <DropdownMenuRadioItem key={t.id} value={t.id}>
                <div className="flex items-center gap-2.5">
                  <Icon size={13} className="text-fg-muted shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm">{t.label}</span>
                    <span className="text-2xs text-fg-subtle font-body normal-case tracking-normal">
                      {t.description}
                    </span>
                  </div>
                </div>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Density</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={density}
          onValueChange={(v) => {
            setDensity(v as Density);
            emit('density.changed', { density: v as Density });
          }}
        >
          {DENSITIES.map((d) => (
            <DropdownMenuRadioItem key={d.id} value={d.id}>
              <span className="text-sm">{d.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
