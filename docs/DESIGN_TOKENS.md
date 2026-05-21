# Design Tokens

The single visual genome of Case Arena. Every component reads semantic CSS
variables, never hard-coded values. Three themes, three densities, all wired
to the same token names.

## Three themes

### Terminal *(default)*
Bloomberg-tinged. Near-black canvas, amber primary, terminal green for
success, mono numerics, optional scanline overlay. Use when working with
dense data, comparing cases, drilling math. **Mood:** trading floor.

| Token         | Value      | Use                                 |
|---------------|------------|-------------------------------------|
| `--bg`        | `#07080A`  | Page canvas                         |
| `--bg-elevated` | `#0E1014` | Cards, panels                       |
| `--accent`    | `#F5A524`  | CTAs, links, focused inputs         |
| `--success`   | `#4ADE80`  | Solved cases, positive deltas       |
| `--danger`    | `#FB7185`  | Errors, negative deltas             |

### Boardroom
Editorial luxury. Deep navy, ivory text, brass accent, Fraunces serif at full
softness. Subtle paper-grain overlay. Use for reading-heavy modules, slow
study. **Mood:** annual report.

| Token         | Value      |
|---------------|------------|
| `--bg`        | `#0B1929`  |
| `--fg`        | `#F5F1E8`  |
| `--accent`    | `#B8923D`  |

### Daylight
Warm light. Off-white canvas, charcoal text, single terracotta accent. No
texture overlay. Use for long study sessions in daylight or bright rooms.
**Mood:** Stripe Press paperback.

| Token         | Value      |
|---------------|------------|
| `--bg`        | `#F7F3EC`  |
| `--fg`        | `#1A1814`  |
| `--accent`    | `#B8410A`  |

## Three densities

| Density       | When                                       |
|---------------|--------------------------------------------|
| `comfortable` | Default for modules, reading               |
| `compact`     | Default for case pages, dashboards         |
| `dense`       | Map view, drill tools, terminal-style data |

## Typography

Fonts loaded self-hosted via `next/font/local` in `app/layout.tsx`. Inter is
banned anywhere in the project.

| Use     | Family                        | Variable                    |
|---------|-------------------------------|-----------------------------|
| Display | Fraunces (variable, opsz+SOFT)| `--font-display-stack`      |
| Body    | Geist                         | `--font-body-stack`         |
| Mono    | JetBrains Mono                | `--font-mono-stack`         |

## Motion

Fast (180ms base). Reduced-motion respected globally via media query AND user
override (`data-reduce-motion="on"`).

## Token files (live source)

- `styles/tokens/colors.css`
- `styles/tokens/typography.css`
- `styles/tokens/spacing.css`
- `styles/tokens/motion.css`
- `styles/tokens/themes.css` (imports all)
- `lib/tokens.ts` (TS export, consumed by Tailwind config)

> Rule: never introduce a hard-coded color, font-size, spacing, or duration in
> a component. If a token doesn't exist for what you need, add it to the
> token files first.
