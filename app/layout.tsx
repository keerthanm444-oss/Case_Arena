import type { Metadata, Viewport } from 'next';
import { Fraunces, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import { ClientProviders } from '@/components/providers/client-providers';
import './globals.css';

/**
 * Fonts — loaded via next/font/google.
 *
 *   Display: Fraunces (variable, supports opsz + SOFT axes for editorial warmth)
 *   Body:    IBM Plex Sans (Geist is replaced with IBM Plex Sans — see note in BUILD_STATE)
 *   Mono:    JetBrains Mono
 *
 * Each emits a CSS variable consumed by styles/tokens/typography.css.
 */

const fontDisplay = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  // Pull the full variable axis range so opsz + SOFT work in CSS
  axes: ['SOFT', 'opsz'],
  weight: 'variable',
});

const fontBody = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Case Arena — 0 to 100 Guide to Case Competitions',
    template: '%s · Case Arena',
  },
  description:
    'A fully interactive, hallucination-free learning platform for business case competitions. 100 real cases, 12 modules, 9 tools, three themes.',
  applicationName: 'Case Arena',
  keywords: [
    'case competitions',
    'business case interview',
    'consulting prep',
    'McKinsey',
    'BCG',
    'Bain',
    'HULT Prize',
    'CFA Research Challenge',
  ],
  authors: [{ name: 'Case Arena' }],
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07080A' },
    { media: '(prefers-color-scheme: light)', color: '#F7F3EC' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * The inline script below runs synchronously before paint to apply the user's
 * preferred theme + density from localStorage. This avoids flash-of-wrong-theme
 * on first render. The full theme switcher (System 5) updates the same keys.
 */
const themeBootstrap = `
  (function() {
    try {
      var t = localStorage.getItem('ca:theme');
      var d = localStorage.getItem('ca:density');
      var r = localStorage.getItem('ca:reduce-motion');
      if (!t || !['terminal','boardroom','daylight'].includes(t)) t = 'terminal';
      if (!d || !['comfortable','compact','dense'].includes(d)) d = 'comfortable';
      document.documentElement.setAttribute('data-theme', t);
      document.documentElement.setAttribute('data-density', d);
      if (r === 'on' || r === 'off') {
        document.documentElement.setAttribute('data-reduce-motion', r);
      }
    } catch (_) {
      document.documentElement.setAttribute('data-theme', 'terminal');
      document.documentElement.setAttribute('data-density', 'comfortable');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
