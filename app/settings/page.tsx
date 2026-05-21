'use client';

import * as React from 'react';
import { Container, PageHeader, Section, Stack } from '@/components/layout';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/display/status-pill';
import { Callout } from '@/components/display/callout';
import { Field, Input, Label } from '@/components/ui/input';
import { usePreferences, type ThemeId, type Density, type MotionPref } from '@/lib/store/preferences-store';
import { useUIStore } from '@/lib/store';
import { resetDb, exportSnapshot } from '@/lib/db/db';
import { useEmit } from '@/lib/event-bus';
import { Download, Trash2 } from 'lucide-react';

/**
 * Settings — client component that reads/writes the preferences store
 * and exposes the dangerous "reset all" + "export snapshot" actions.
 */

const THEMES: Array<{ id: ThemeId; label: string; sub: string }> = [
  { id: 'terminal', label: 'Terminal', sub: 'Near-black, amber accent, mono numerics' },
  { id: 'boardroom', label: 'Boardroom', sub: 'Deep navy + ivory + brass, editorial' },
  { id: 'daylight', label: 'Daylight', sub: 'Warm off-white, terracotta accent' },
];
const DENSITIES: Array<{ id: Density; label: string; sub: string }> = [
  { id: 'comfortable', label: 'Comfortable', sub: 'Default reading & study' },
  { id: 'compact', label: 'Compact', sub: 'For case + dashboard pages' },
  { id: 'dense', label: 'Dense', sub: 'Map view, drills, terminal-style data' },
];
const MOTION_OPTIONS: Array<{ id: MotionPref; label: string }> = [
  { id: 'auto', label: 'Auto (follow OS prefers-reduced-motion)' },
  { id: 'on', label: 'Reduce motion · on' },
  { id: 'off', label: 'Reduce motion · off (full animations)' },
];

export default function SettingsPage() {
  const prefs = usePreferences();
  const toast = useUIStore((s) => s.toast);
  const emit = useEmit();
  const [confirmReset, setConfirmReset] = React.useState(false);

  function onExport() {
    void (async () => {
      try {
        const snap = await exportSnapshot();
        const blob = new Blob([JSON.stringify(snap, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `case-arena-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast('success', 'Snapshot downloaded.');
      } catch (e) {
        toast('danger', 'Export failed. See console.');
        console.error(e);
      }
    })();
  }

  function onReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    void (async () => {
      try {
        await resetDb();
        toast('success', 'All local data cleared.');
        setConfirmReset(false);
      } catch (e) {
        toast('danger', 'Reset failed. See console.');
        console.error(e);
      }
    })();
  }

  return (
    <div className="py-10">
      <Container width="lg">
        <PageHeader
          eyebrow={<StatusPill tone="accent">System 5 · Nervous</StatusPill>}
          title="Settings"
          description="All preferences live on this device. No accounts, no sync. The optional AI Case Partner uses your own API key, stored only in browser storage."
        />

        {/* ---- Theme ---- */}
        <Section eyebrow="Appearance" title="Theme">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <Card
                key={t.id}
                variant={prefs.theme === t.id ? 'accent' : 'panel'}
                interactive
                onClick={() => {
                  prefs.setTheme(t.id);
                  void emit('theme.changed', { theme: t.id });
                }}
                className="cursor-pointer"
              >
                <CardHeader>
                  <Stack direction="row" gap={2} align="center">
                    <CardTitle>{t.label}</CardTitle>
                    {prefs.theme === t.id && (
                      <StatusPill tone="accent" size="xs">
                        Active
                      </StatusPill>
                    )}
                  </Stack>
                  <CardDescription>{t.sub}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Section>

        {/* ---- Density ---- */}
        <Section eyebrow="Layout" title="Density">
          <Card variant="panel">
            <ul>
              {DENSITIES.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line last:border-b-0"
                >
                  <div>
                    <div className="text-sm text-fg">{d.label}</div>
                    <div className="text-xs text-fg-muted">{d.sub}</div>
                  </div>
                  <input
                    type="radio"
                    name="density"
                    checked={prefs.density === d.id}
                    onChange={() => {
                      prefs.setDensity(d.id);
                      void emit('density.changed', { density: d.id });
                    }}
                    className="accent-[var(--accent)] w-4 h-4 cursor-pointer"
                    aria-label={d.label}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        {/* ---- Motion ---- */}
        <Section eyebrow="Motion" title="Reduce motion">
          <Card variant="panel">
            <ul>
              {MOTION_OPTIONS.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line last:border-b-0"
                >
                  <span className="text-sm text-fg">{m.label}</span>
                  <input
                    type="radio"
                    name="motion"
                    checked={prefs.reduceMotion === m.id}
                    onChange={() => prefs.setReduceMotion(m.id)}
                    className="accent-[var(--accent)] w-4 h-4 cursor-pointer"
                  />
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        {/* ---- Misc toggles ---- */}
        <Section eyebrow="Interaction">
          <Card variant="panel">
            <ul>
              <li className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
                <div>
                  <div className="text-sm text-fg">Show keyboard hints</div>
                  <div className="text-xs text-fg-muted">
                    Display kbd badges next to sidebar items
                  </div>
                </div>
                <Switch
                  checked={prefs.showKeyboardHints}
                  onCheckedChange={prefs.setKeyboardHints}
                />
              </li>
              <li className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-sm text-fg">Practice timer sounds</div>
                  <div className="text-xs text-fg-muted">
                    Audio cues when phase boundaries are reached
                  </div>
                </div>
                <Switch
                  checked={prefs.timerSounds}
                  onCheckedChange={prefs.setTimerSounds}
                />
              </li>
            </ul>
          </Card>
        </Section>

        {/* ---- AI partner BYO key ---- */}
        <Section eyebrow="Optional AI" title="AI Case Partner">
          <Callout tone="note" hideIcon>
            The AI partner is optional. The app works completely without it.
            Your API key is stored only in this browser. Nothing is sent to
            Anthropic or any first-party server.
          </Callout>
          <Card variant="panel" className="mt-4">
            <CardBody className="grid gap-4 pt-4">
              <Field label="Provider">
                <select
                  value={prefs.ai?.provider ?? ''}
                  onChange={(e) =>
                    prefs.setAI(
                      e.target.value
                        ? {
                            provider: e.target.value as 'groq' | 'google' | 'openrouter',
                            apiKey: prefs.ai?.apiKey ?? '',
                            model: prefs.ai?.model,
                          }
                        : null,
                    )
                  }
                  className="h-9 px-3 rounded-md border border-line bg-bg-elevated text-fg text-sm"
                >
                  <option value="">— none —</option>
                  <option value="groq">Groq (free tier)</option>
                  <option value="google">Google AI Studio (free tier)</option>
                  <option value="openrouter">OpenRouter (free tier models)</option>
                </select>
              </Field>
              <Field label="API key" helper="Stored in localStorage. Never sent to first-party servers.">
                <Input
                  type="password"
                  placeholder="sk-…"
                  value={prefs.ai?.apiKey ?? ''}
                  onChange={(e) =>
                    prefs.setAI(
                      prefs.ai
                        ? { ...prefs.ai, apiKey: e.target.value }
                        : { provider: 'groq', apiKey: e.target.value },
                    )
                  }
                />
              </Field>
              <Field label="Model (optional)">
                <Input
                  placeholder="llama-3.1-70b-versatile"
                  value={prefs.ai?.model ?? ''}
                  onChange={(e) =>
                    prefs.setAI(
                      prefs.ai
                        ? { ...prefs.ai, model: e.target.value || undefined }
                        : { provider: 'groq', apiKey: '', model: e.target.value },
                    )
                  }
                />
              </Field>
            </CardBody>
          </Card>
        </Section>

        {/* ---- Danger zone ---- */}
        <Section eyebrow="Data" title="Local data">
          <Card variant="panel">
            <CardBody className="pt-4 grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-fg">Export snapshot</div>
                  <div className="text-xs text-fg-muted">
                    Download a JSON file of all your progress, drills, saves, and event log
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={onExport} leading={<Download size={12} />}>
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
                <div>
                  <div className="text-sm text-fg">Reset all local data</div>
                  <div className="text-xs text-fg-muted">
                    Clears IndexedDB and preferences. Cannot be undone.
                  </div>
                </div>
                <Button
                  variant={confirmReset ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={onReset}
                  leading={<Trash2 size={12} />}
                >
                  {confirmReset ? 'Confirm — clear everything' : 'Reset…'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </Section>
      </Container>
    </div>
  );
}
