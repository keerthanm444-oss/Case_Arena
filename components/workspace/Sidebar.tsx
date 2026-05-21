'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  FolderOpen,
  GitBranch,
  Wrench,
  Library,
  LayoutDashboard,
  Search,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Kbd } from '@/components/ui/kbd';
import { SimpleTooltip } from '@/components/ui/tooltip';

/**
 * Sidebar — persistent left navigation.
 *
 * Two states: expanded (260px) and collapsed (52px, icon-only).
 * Collapse toggle is at the bottom. When collapsed, tooltips reveal labels.
 *
 * Sections:
 *   1. Primary nav — Home / Modules / Cases / Map / Tools / Resources / Dashboard
 *   2. Secondary nav — Search / Settings
 *   3. Footer — collapse toggle + version
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Keyboard hint shown next to label */
  kbd?: string;
  /** A pathname is "active" when it matches exactly OR starts with `${href}/` */
  exact?: boolean;
}

const PRIMARY: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, kbd: 'g h', exact: true },
  { href: '/modules', label: 'Modules', icon: BookOpen, kbd: 'g m' },
  { href: '/cases', label: 'Cases', icon: FolderOpen, kbd: 'g c' },
  { href: '/map', label: 'Map', icon: GitBranch, kbd: 'g x' },
  { href: '/tools', label: 'Tools', icon: Wrench, kbd: 'g t' },
  { href: '/resources', label: 'Resources', icon: Library, kbd: 'g r' },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, kbd: 'g d' },
];

const SECONDARY: NavItem[] = [
  { href: '/search', label: 'Search', icon: Search, kbd: '⌘ K' },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname() ?? '/';

  return (
    <aside
      className={cn(
        'shrink-0 h-full',
        'bg-bg-panel border-r border-line',
        'flex flex-col',
        'transition-[width] duration-base ease-out-custom',
        collapsed ? 'w-[52px]' : 'w-[260px]',
      )}
      aria-label="Primary navigation"
    >
      {/* Logo / brand */}
      <div
        className={cn(
          'flex items-center gap-2 h-[var(--topbar-h)] px-3 border-b border-line shrink-0',
          collapsed && 'justify-center px-0',
        )}
      >
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 rounded-sm px-1 py-1',
            'hover:bg-bg-elevated transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
          )}
          aria-label="Case Arena home"
        >
          <div
            className="w-6 h-6 rounded-sm grid place-items-center shrink-0"
            style={{ background: 'var(--accent-soft)' }}
          >
            <Sparkles size={14} className="text-accent" />
          </div>
          {!collapsed && (
            <span
              className="font-display font-medium tracking-tighter text-fg"
              style={{
                fontSize: 'var(--text-md)',
                fontVariationSettings: "'opsz' 32, 'SOFT' 100",
              }}
            >
              Case Arena
            </span>
          )}
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <NavSection label="Workspace" collapsed={collapsed}>
          {PRIMARY.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(pathname, item)} collapsed={collapsed} />
          ))}
        </NavSection>

        <NavSection label="System" collapsed={collapsed}>
          {SECONDARY.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(pathname, item)} collapsed={collapsed} />
          ))}
        </NavSection>
      </nav>

      {/* Footer — collapse toggle + version stamp */}
      <div className={cn('border-t border-line px-2 py-2 flex items-center', collapsed ? 'flex-col gap-2' : 'gap-2 justify-between')}>
        <SimpleTooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="right">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              'w-7 h-7 grid place-items-center rounded-sm',
              'text-fg-muted hover:text-fg hover:bg-bg-elevated',
              'transition-colors duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </SimpleTooltip>
        {!collapsed && (
          <span className="font-mono text-2xs text-fg-subtle tracking-wider">
            v0.5 · S5
          </span>
        )}
      </div>
    </aside>
  );
}

function NavSection({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="px-2 mb-3">
      {!collapsed && (
        <div className="font-mono text-2xs uppercase tracking-widest text-fg-subtle px-2 mb-1.5">
          {label}
        </div>
      )}
      <div className="grid gap-0.5">{children}</div>
    </div>
  );
}

function NavRow({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const inner = (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-2.5 rounded-sm',
        'px-2 py-1.5',
        'text-sm transition-colors duration-fast',
        active
          ? 'bg-bg-elevated text-fg'
          : 'text-fg-muted hover:bg-bg-elevated hover:text-fg',
        collapsed && 'justify-center px-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        size={14}
        className={cn(
          'shrink-0',
          active ? 'text-accent' : 'text-fg-muted group-hover:text-fg',
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.kbd && <Kbd combo={item.kbd.includes(' ')}>{item.kbd}</Kbd>}
        </>
      )}
    </Link>
  );
  if (collapsed) {
    return (
      <SimpleTooltip
        content={
          <span className="flex items-center gap-2">
            {item.label}
            {item.kbd && (
              <span className="opacity-60 font-mono">{item.kbd}</span>
            )}
          </span>
        }
        side="right"
      >
        {inner}
      </SimpleTooltip>
    );
  }
  return inner;
}
