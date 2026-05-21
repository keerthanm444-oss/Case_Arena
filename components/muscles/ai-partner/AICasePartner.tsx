'use client';

import * as React from 'react';
import Link from 'next/link';
import { Send, Loader2, Bot, User, Key } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Callout } from '@/components/display/callout';
import { StatusPill } from '@/components/display/status-pill';
import { MuscleToolbar } from '@/components/muscles/shared/MuscleToolbar';
import { usePreferences } from '@/lib/store/preferences-store';
import { chat, AIProviderError, type ChatMessage } from '@/lib/ai/provider';
import { SOCRATIC_SYSTEM_PROMPT, STARTER_PROMPTS } from './system-prompt';
import { useEmit } from '@/lib/event-bus';
import { useUIStore } from '@/lib/store';

/**
 * AICasePartner — optional muscle, BYO-key Socratic case partner.
 *
 * If no API key is configured, shows a friendly setup prompt with a link
 * to Settings. If configured, renders a chat UI that talks directly to
 * the provider's OpenAI-compatible endpoint.
 *
 * Nothing is sent to any first-party server.
 */

interface UIMessage extends ChatMessage {
  id: string;
}

export function AICasePartner() {
  const ai = usePreferences((s) => s.ai);
  const [messages, setMessages] = React.useState<UIMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const emit = useEmit();
  const toast = useUIStore((s) => s.toast);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!ai?.apiKey) {
    return (
      <div className="flex flex-col gap-3">
        <MuscleToolbar />
        <Card variant="panel" className="rounded-t-none border-t-0 -mt-3">
          <CardBody className="pt-6">
            <Callout tone="note" hideIcon className="mb-4">
              <span className="font-mono text-2xs uppercase tracking-wider text-fg-muted">
                Optional · self-hosted ·
              </span>{' '}
              This muscle uses your own API key. Nothing is sent to any first-party server.
              Free tiers available from Groq, Google AI Studio, or OpenRouter.
            </Callout>
            <div className="text-center py-6">
              <Key size={32} className="text-fg-subtle mx-auto mb-3" aria-hidden />
              <h3 className="text-md text-fg mb-1">No API key configured</h3>
              <p className="text-sm text-fg-muted mb-4 max-w-md mx-auto">
                Add your free-tier key in Settings to enable the partner.
                The rest of the app works fully without it.
              </p>
              <Button asChild variant="primary" size="md">
                <Link href="/settings">Configure in Settings</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  async function send(content: string) {
    if (!content.trim() || sending) return;
    const userMsg: UIMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
    };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      const resp = await chat({
        provider: ai!.provider,
        apiKey: ai!.apiKey,
        model: ai!.model || undefined,
        messages: [
          { role: 'system', content: SOCRATIC_SYSTEM_PROMPT },
          ...history,
          { role: 'user', content },
        ],
        temperature: 0.4,
      });
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: resp.text || '(empty response)',
        },
      ]);
    } catch (e) {
      if (e instanceof AIProviderError) {
        toast(
          'danger',
          `Provider returned ${e.status}. Check key, model, and rate limits.`,
        );
      } else {
        toast('danger', 'Network error. Check connection.');
      }
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setMessages([]);
    setInput('');
  }

  return (
    <div className="flex flex-col gap-3">
      <MuscleToolbar
        actions={
          <>
            <StatusPill tone="outline" size="xs">{ai.provider}</StatusPill>
            <Button variant="ghost" size="sm" onClick={reset}>
              New session
            </Button>
          </>
        }
      />

      <Card variant="panel" className="rounded-t-none border-t-0 -mt-3 flex flex-col" style={{ minHeight: 480 }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 grid gap-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot size={28} className="text-fg-subtle mx-auto mb-3" aria-hidden />
              <h3 className="text-md text-fg mb-1">Your Socratic partner is ready</h3>
              <p className="text-sm text-fg-muted mb-4 max-w-md mx-auto">
                Ask for a case in any industry. The partner will run it like
                a McKinsey interviewer — never giving the answer, always
                challenging your structure.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="text-xs px-3 py-1.5 rounded-pill border border-line bg-bg-elevated text-fg-muted hover:text-fg hover:border-line-strong transition-colors duration-fast"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'grid grid-cols-[auto_1fr] gap-3 items-start',
                  m.role === 'user' && 'opacity-90',
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-sm grid place-items-center shrink-0',
                    m.role === 'assistant' ? 'bg-accent-soft text-accent' : 'bg-bg-elevated text-fg-muted',
                  )}
                >
                  {m.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
                </div>
                <div
                  className={cn(
                    'text-sm text-fg leading-relaxed whitespace-pre-wrap',
                    m.role === 'assistant' && 'border-l-2 border-l-accent-soft pl-3',
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
              <div className="w-6 h-6 rounded-sm grid place-items-center bg-accent-soft text-accent">
                <Loader2 size={12} className="animate-spin" />
              </div>
              <span className="text-sm text-fg-muted">Thinking…</span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-line p-3 flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a case, or respond to the partner…"
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="md" disabled={sending || !input.trim()} leading={<Send size={12} />}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
