# Brainstorm Design System

> A warm, inviting design system for the Infinite University — where learning never ends.

---

## Design Philosophy

| Attribute | Expression |
|-----------|------------|
| **Warm** | Amber accents, cream backgrounds, soft shadows |
| **Inviting** | Generous whitespace, rounded corners, gentle animations |
| **Expansive** | Open layouts, the graph as infinite canvas |
| **Celebratory** | Nodes pulse when added, connections animate, growth is visible |

The interface should feel like walking into a warm library that knows you — not a sterile productivity app.

---

## Technology

| Layer | Tool |
|-------|------|
| CSS Framework | Tailwind CSS v4 with `@theme inline` |
| Color Space | OKLch (`oklch(L C H)`) |
| Icons | `lucide-react` |
| Fonts | Inter, Plus Jakarta Sans, Geist Mono (via `next/font/google`) |
| Animation | CSS keyframes + `motion` (Motion for React) |
| UI Components | shadcn/ui (`button`, `card`, `dialog`) |
| Dark Mode | `@custom-variant dark (&:is(.dark *))` |
| Styling File | [globals.css](app/app/globals.css) |

### CSS Architecture (Tailwind v4)

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... maps CSS vars to Tailwind utilities */
}
```

No `tailwind.config.ts` — all theme configuration lives inline in [globals.css](app/app/globals.css).

---

## Color System

All colors use **OKLch** format: `oklch(Lightness Chroma Hue)`.

### Light Mode

| Token | Value | Role |
|-------|-------|------|
| `--background` | `oklch(0.97 0.01 75)` | Page background (warm cream) |
| `--foreground` | `oklch(0.25 0.01 50)` | Primary text |
| `--card` | `oklch(0.99 0.005 75)` | Card surfaces |
| `--card-foreground` | `oklch(0.25 0.01 50)` | Card text |
| `--popover` | `oklch(0.99 0.005 75)` | Popover surfaces |
| `--popover-foreground` | `oklch(0.25 0.01 50)` | Popover text |
| `--primary` | `oklch(0.72 0.15 60)` | Primary actions (warm amber) |
| `--primary-foreground` | `oklch(0.97 0.01 75)` | Text on primary |
| `--secondary` | `oklch(0.92 0.02 140)` | Success, completion (soft sage) |
| `--secondary-foreground` | `oklch(0.35 0.04 140)` | Text on secondary |
| `--muted` | `oklch(0.93 0.01 70)` | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.50 0.01 60)` | Secondary text |
| `--accent` | `oklch(0.95 0.04 70)` | Highlights, hover (amber glow) |
| `--accent-foreground` | `oklch(0.45 0.12 60)` | Text on accent |
| `--destructive` | `oklch(0.58 0.22 25)` | Errors, deletions |
| `--destructive-foreground` | `oklch(0.97 0.01 75)` | Text on destructive |
| `--border` | `oklch(0.88 0.01 70)` | Borders |
| `--input` | `oklch(0.88 0.01 70)` | Input borders |
| `--ring` | `oklch(0.72 0.15 60)` | Focus rings (amber) |

### Dark Mode

| Token | Value | Role |
|-------|-------|------|
| `--background` | `oklch(0.20 0.01 50)` | Page background (warm charcoal) |
| `--foreground` | `oklch(0.92 0.01 70)` | Primary text (warm white) |
| `--card` | `oklch(0.23 0.01 50)` | Card surfaces |
| `--card-foreground` | `oklch(0.92 0.01 70)` | Card text |
| `--popover` | `oklch(0.23 0.01 50)` | Popover surfaces |
| `--popover-foreground` | `oklch(0.92 0.01 70)` | Popover text |
| `--primary` | `oklch(0.75 0.13 65)` | Primary actions (slightly desaturated amber) |
| `--primary-foreground` | `oklch(0.20 0.01 50)` | Text on primary |
| `--secondary` | `oklch(0.30 0.03 140)` | Success states (dark sage) |
| `--secondary-foreground` | `oklch(0.85 0.02 140)` | Text on secondary |
| `--muted` | `oklch(0.30 0.01 60)` | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.65 0.01 65)` | Secondary text |
| `--accent` | `oklch(0.32 0.05 65)` | Highlights (dark amber) |
| `--accent-foreground` | `oklch(0.80 0.08 65)` | Text on accent |
| `--destructive` | `oklch(0.62 0.20 25)` | Errors |
| `--destructive-foreground` | `oklch(0.92 0.01 70)` | Text on destructive |
| `--border` | `oklch(0.30 0.01 60)` | Borders |
| `--input` | `oklch(0.30 0.01 60)` | Input borders |
| `--ring` | `oklch(0.75 0.13 65)` | Focus rings (amber) |

### Chart Colors

| Token | Light | Dark | Intent |
|-------|-------|------|--------|
| `--chart-1` | `oklch(0.65 0.15 60)` | `oklch(0.70 0.13 65)` | Amber |
| `--chart-2` | `oklch(0.60 0.10 140)` | `oklch(0.55 0.08 140)` | Sage |
| `--chart-3` | `oklch(0.55 0.12 250)` | `oklch(0.60 0.10 260)` | Purple |
| `--chart-4` | `oklch(0.70 0.14 80)` | `oklch(0.75 0.12 80)` | Yellow |
| `--chart-5` | `oklch(0.65 0.12 20)` | `oklch(0.65 0.11 25)` | Coral |

### Sidebar Colors

| Token | Light | Dark |
|-------|-------|------|
| `--sidebar` | `oklch(0.97 0.01 70)` | `oklch(0.18 0.01 50)` |
| `--sidebar-foreground` | `oklch(0.30 0.01 50)` | `oklch(0.90 0.01 70)` |
| `--sidebar-primary` | `oklch(0.72 0.15 60)` | `oklch(0.75 0.13 65)` |
| `--sidebar-primary-foreground` | `oklch(0.97 0.01 75)` | `oklch(0.20 0.01 50)` |
| `--sidebar-accent` | `oklch(0.94 0.02 65)` | `oklch(0.28 0.03 60)` |
| `--sidebar-accent-foreground` | `oklch(0.45 0.12 60)` | `oklch(0.80 0.08 65)` |
| `--sidebar-border` | `oklch(0.90 0.01 70)` | `oklch(0.28 0.01 55)` |
| `--sidebar-ring` | `oklch(0.72 0.15 60)` | `oklch(0.75 0.13 65)` |

### Brand Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--amber` | `oklch(0.72 0.15 60)` | `oklch(0.75 0.13 65)` | Primary actions, curiosity |
| `--amber-light` | `oklch(0.92 0.06 65)` | `oklch(0.35 0.06 60)` | Soft amber backgrounds |
| `--amber-glow` | `oklch(0.80 0.18 60)` | `oklch(0.80 0.16 65)` | Glow effects, animations |
| `--sage` | `oklch(0.65 0.08 145)` | `oklch(0.60 0.07 145)` | Completion, calm states |
| `--sage-light` | `oklch(0.92 0.04 140)` | `oklch(0.28 0.04 140)` | Soft sage backgrounds |
| `--sage-muted` | `oklch(0.95 0.02 140)` | `oklch(0.25 0.02 140)` | Very subtle sage tints |
| `--coral` | `oklch(0.65 0.14 25)` | `oklch(0.68 0.12 28)` | Warm accent |
| `--lavender` | `oklch(0.65 0.10 280)` | `oklch(0.68 0.09 280)` | Cool accent, ideas |

Tailwind utilities: `bg-amber`, `text-sage`, `border-coral`, etc.

### Node Colors (Knowledge Graph)

| Token | Light | Dark | Node Type |
|-------|-------|------|-----------|
| `--node-objective` | `oklch(0.72 0.15 60)` | `oklch(0.75 0.13 65)` | Learning objectives (amber) |
| `--node-project` | `oklch(0.60 0.12 250)` | `oklch(0.65 0.10 255)` | Projects (blue) |
| `--node-idea` | `oklch(0.60 0.14 300)` | `oklch(0.65 0.12 300)` | Ideas (violet) |
| `--node-concept` | `oklch(0.60 0.12 155)` | `oklch(0.65 0.10 155)` | Concepts (emerald) |

Tailwind utilities: `bg-node-objective`, `text-node-idea`, etc.

### Status Colors

| Token | Light | Dark | Status |
|-------|-------|------|--------|
| `--status-exploring` | `oklch(0.72 0.15 60)` | `oklch(0.75 0.13 65)` | Amber (active, curious) |
| `--status-deepening` | `oklch(0.60 0.12 250)` | `oklch(0.65 0.10 255)` | Blue (focused) |
| `--status-resting` | `oklch(0.65 0.08 145)` | `oklch(0.60 0.07 145)` | Sage (calm, welcoming) |
| `--status-not-started` | `oklch(0.70 0.01 60)` | `oklch(0.55 0.01 60)` | Muted gray (neutral) |

Tailwind utilities: `bg-status-exploring`, `text-status-resting`, etc.

---

## Typography

### Font Stack

| Variable | Font | Usage |
|----------|------|-------|
| `--font-sans` | Inter | Body text, UI elements |
| `--font-display` | Plus Jakarta Sans | Headings, emphasis, page titles |
| `--font-mono` | Geist Mono | Code blocks, technical content |

Fonts are loaded via `next/font/google` in [layout.tsx](app/app/layout.tsx) with `display: "swap"`.

### Usage Guidelines

- Use `font-display` for page titles and section headings
- Body text uses default `font-sans` (Inter)
- Code snippets and technical values use `font-mono`
- Maintain generous `leading` (line-height) for readability

---

## Icons

Uses **lucide-react** as the icon library.

### Icons in Use

| Icon | Import | Used In |
|------|--------|---------|
| `Sparkles` | `lucide-react` | Logo, branding, nav |
| `Mail` | `lucide-react` | Email input fields |
| `Lock` | `lucide-react` | Password input fields |
| `Eye` / `EyeOff` | `lucide-react` | Password visibility toggle |
| `ArrowRight` | `lucide-react` | Submit buttons, CTAs |
| `Loader2` | `lucide-react` | Loading spinners (with `animate-spin`) |
| `LogOut` | `lucide-react` | Logout button |
| `Clock` | `lucide-react` | Landing — "No Deadlines" philosophy |
| `Network` | `lucide-react` | Landing — knowledge graph feature |
| `MessageCircle` | `lucide-react` | Landing — AI co-design, Socratic dialogue |
| `BookOpen` | `lucide-react` | Landing — walkthrough co-design step |
| `Lightbulb` | `lucide-react` | Landing — open questions, ideas |
| `Layers` | `lucide-react` | Landing — infinite depth feature |
| `Send` | `lucide-react` | Landing — interactive demo submit |
| `GraduationCap` | `lucide-react` | Landing — lifelong learners persona |
| `Microscope` | `lucide-react` | Landing — researchers persona |
| `Hammer` | `lucide-react` | Landing — builders persona |
| `Compass` | `lucide-react` | Landing — curious minds persona |
| `PartyPopper` | `lucide-react` | Landing — walkthrough celebration step |
| `X` | `lucide-react` | Dialog close button (shadcn) |

### Sizing Conventions

| Context | Size | Class |
|---------|------|-------|
| Inline with text | 16px | `w-4 h-4` |
| Button icons | 18px | `w-[18px] h-[18px]` |
| Standalone/hero | 20–24px | `w-5 h-5` or `w-6 h-6` |

---

## Spacing & Layout

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.75rem` (12px) | Base radius |
| `--radius-sm` | `calc(var(--radius) - 4px)` | Small elements |
| `--radius-md` | `calc(var(--radius) - 2px)` | Medium elements |
| `--radius-lg` | `var(--radius)` | Cards, containers |
| `--radius-xl` | `calc(var(--radius) + 4px)` | Modals |
| `--radius-2xl` | `calc(var(--radius) + 8px)` | Large surfaces |

### Container Pattern

- Max-width based layouts with centered content
- `px-4 sm:px-6` responsive horizontal padding
- Generous vertical spacing between sections

### Whitespace Philosophy

Let content breathe. Prefer generous `gap`, `p`, and `my` values. Cramped layouts contradict the "infinite library" feel.

---

## Animation System

### Available Animations

From `tw-animate-css`, Tailwind defaults, and custom keyframes in [globals.css](app/app/globals.css):

| Class | Effect | Duration | Source |
|-------|--------|----------|--------|
| `animate-spin` | Continuous rotation | Infinite | Tailwind default |
| `animate-pulse` | Gentle opacity pulse | Infinite | Tailwind default |
| `animate-fade-in` | Content appearing | 0.4s ease-out | Custom keyframe |
| `animate-scale-in` | Scale + fade in (modals) | 0.3s ease-out | Custom keyframe |
| `animate-pulse-glow` | Amber glow pulse | 2s infinite | Custom keyframe |
| `animate-node-appear` | Scale bounce (new nodes) | 0.5s ease-out | Custom keyframe |
| `animate-connection-draw` | SVG edge drawing in | 0.8s forwards | Custom keyframe |
| `animate-float` | Subtle vertical float | 3s infinite | Custom keyframe |

### When to Use

| Animation | Use Case |
|-----------|----------|
| `pulse-glow` | Currently selected node, active exploration |
| `node-appear` | New node added to graph (celebratory) |
| `connection-draw` | Edge appearing between nodes (SVG) |
| `fade-in` | Content loading, page transitions |
| `scale-in` | Modals, emphasis reveals |
| `float` | Curiosity sparks, suggestions |

### Motion for React

Use the **Motion** library (`motion`) for React component animations:
- Page transitions
- Staggered list reveals
- Interactive hover/tap states
- Graph node interactions

Prefer CSS keyframes for simple repeating animations, Motion for orchestrated or interactive ones.

---

## Utility Classes

All classes defined in [globals.css](app/app/globals.css):

### Text Effects

| Class | Effect |
|-------|--------|
| `text-gradient-warm` | Amber gradient text (headings) |

### Gradient Backgrounds

| Class | Effect |
|-------|--------|
| `from-sage-50` | Sage gradient stop for backgrounds |
| `gradient-warm` | Amber → coral diagonal gradient (CTAs) |
| `gradient-sage` | Sage-light → sage gradient (success states) |
| `gradient-glow` | Radial amber glow (emphasis) |

### Glassmorphism

| Class | Effect |
|-------|--------|
| `glass` | Frosted glass overlay (blur + transparency, dark mode aware) |

### Node Glow Effects

| Class | Color | Use |
|-------|-------|-----|
| `node-glow-objective` | Amber | Learning objective nodes |
| `node-glow-project` | Blue | Project nodes |
| `node-glow-idea` | Violet | Idea nodes |
| `node-glow-concept` | Emerald | Concept nodes |

---

## Component Patterns

Uses **shadcn/ui** components (`button`, `card`, `dialog`) alongside plain Tailwind classes. Components are in [components/ui/](app/components/ui/).

### Buttons (shadcn)

```tsx
import { Button } from '@/components/ui/button';

<Button>Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="secondary">Secondary</Button>
<Button size="lg" asChild><Link href="/login">CTA</Link></Button>
```

Variants: `default` (amber primary), `outline`, `ghost`, `secondary` (sage), `destructive`, `link`.
Sizes: `default`, `sm`, `lg`, `icon`.

- Primary: Amber background for main actions
- Ghost: For toolbar actions, navigation
- Never use destructive styling for anything except actual deletions

### Cards

```tsx
<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
  <h3 className="font-display text-lg font-semibold text-card-foreground">Title</h3>
  <p className="text-muted-foreground mt-2">Description</p>
</div>
```

- Use `bg-card` for surfaces, never `bg-white`
- Subtle border with `border-border`
- Shadow: `shadow-sm`
- Rounded: `rounded-lg`

### Dialog (shadcn)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

### Form Inputs

Pattern from login/signup forms:

```tsx
<div className="relative">
  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
  <input
    type="email"
    className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border rounded-xl
               text-foreground placeholder:text-muted-foreground/60
               focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50
               transition-all duration-200"
    placeholder="your@email.com"
  />
</div>
```

### Status Indicators

| Status | Style |
|--------|-------|
| Exploring | Amber dot/badge, optional pulse |
| Deepening | Blue indicator, steady |
| Resting | Sage indicator, calm |
| Not Started | Muted gray, neutral |

---

## Dark Mode

Triggered by adding `.dark` class to an ancestor element.

### Approach

```css
@custom-variant dark (&:is(.dark *));
```

### Principles

- **Warm charcoal** backgrounds (`oklch(0.20 0.01 50)`), not pure black
- Reduced contrast for eye comfort
- Amber remains vibrant but slightly desaturated (`0.13` chroma vs `0.15`)
- Sage shifts brighter for visibility
- All tokens have dedicated dark mode values in [globals.css](app/app/globals.css)

---

## Microcopy Guidelines

### Tone

The interface should speak like a warm, patient mentor:

| Do | Don't |
|----|-------|
| "Welcome back, explorer" | "You haven't logged in for 5 days" |
| "Your graph is growing" | "3 modules incomplete" |
| "Interesting connection ahead" | "Deadline approaching" |
| "Rest as long as you need" | "You're behind on..." |

### Status Language

| Status | Copy Tone |
|--------|-----------|
| `exploring` | Curious, discovering |
| `deepening` | Focused, mastering |
| `resting` | Warm, welcoming return |
| `not_started` | Neutral, inviting |

### Empty States

- Warm, encouraging messaging
- Suggest next steps
- Use icons with amber accents
- Never just "Nothing here"

---

## File Organization

| Type | Path |
|------|------|
| Global CSS & Theme | [app/globals.css](app/app/globals.css) |
| Root Layout & Fonts | [app/layout.tsx](app/app/layout.tsx) |
| Public Pages | [app/(public)/](app/app/(public)/) |
| Protected Pages | [app/(protected)/](app/app/(protected)/) |
| Shared Components | [app/components/](app/app/components/) |
| Landing Components | [app/components/landing/](app/app/components/landing/) |
| shadcn UI Components | [components/ui/](app/components/ui/) |
| Supabase Client | [lib/supabase/](app/lib/supabase/) |
| Server Actions | [app/actions/](app/app/actions/) |
| Design Docs | [docs/](docs/) |

---

## Best Practices

1. **Use OKLch format only** — all color values must use `oklch()`. Never introduce HSL or hex in CSS variables.
2. **Use semantic tokens** — write `text-muted-foreground`, not `text-gray-500`. Never hardcode colors.
3. **Support dark mode** — every component must look correct in both modes. Use token colors, not raw values.
4. **shadcn/ui for reusable components** — use `Button`, `Card`, `Dialog` from `@/components/ui`. Build custom UI with Tailwind utility classes.
5. **lucide-react for icons** — consistent icon source. Follow sizing conventions.
6. **`font-display` for headings** — use Plus Jakarta Sans for visual hierarchy.
7. **Generous whitespace** — let content breathe. Cramped layouts break the "infinite library" feel.
8. **Celebrate growth** — animations should feel satisfying and organic, reinforcing knowledge graph expansion.
9. **No punishment UI** — never use reds, warnings, or urgent language for non-error states.
10. **Tailwind v4 patterns** — use `@theme inline` for theme extensions, `@custom-variant` for variants. No config file.
