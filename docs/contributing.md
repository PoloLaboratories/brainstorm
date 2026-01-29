# Contributing to Brainstorm

This guide helps contributors maintain the conceptual consistency of Brainstorm. Before implementing new features, understand the philosophy that shapes every decision.

---

## Core Philosophy Checklist

Before writing any code, ask yourself these questions:

### 1. Does this support discovery?

> **When you're learning, you don't know what you don't know.**

Features should help users find what they don't know they need. Avoid:
- Fixed catalogs users must choose from
- Linear sequences that assume the end is known
- Features that require users to define scope upfront

Prefer:
- Conversational interfaces that surface options
- AI-assisted exploration that reveals connections
- Gradual disclosure of complexity

### 2. Does this avoid punishment?

Brainstorm has no failure states. Users are never penalized for:
- Taking breaks (paths "rest", they don't "fail")
- Changing direction (pivoting is discovering, not quitting)
- Moving slowly (some modules take years)
- Not completing things (completion is optional)

If your feature introduces any concept of "behind", "overdue", or "incomplete" as negative states — reconsider.

### 3. Does this grow the graph?

Every meaningful action should potentially add nodes or edges to the knowledge graph. Ask:
- What new node might this create?
- What connections might this reveal?
- How does this make the graph more interesting?

The graph is the primary reward mechanism. Features that don't contribute to it feel disconnected.

### 4. Does this feel like a conversation?

AI interactions should be Socratic, not instructional. The AI:
- Asks clarifying questions
- Proposes rather than prescribes
- Surfaces options rather than dictating paths
- Remembers context across sessions

Avoid AI that lectures, assigns, or evaluates without invitation.

### 5. Does this respect open-endedness?

No forced timelines. No required sequences. Users control:
- When they engage
- How deep they go
- What order they explore
- Whether they ever "finish"

---

## Entity Relationships

When adding features that touch existing entities, preserve these relationships:

```
Path
├── contains Modules
├── links to Concepts
├── has Learning Objectives
└── can emerge from Ideas (conversations)

Module
├── belongs to Path
├── contains Learning Objectives
├── contains Open Questions
├── has Prerequisites (other Modules)
└── links to Concepts

Learning Objectives
├── belongs to Module, Learning Paths, or Projects
├── has Resources
├── links to Concepts
├── connects to Ideas
├── connects to Projects
└── can emerge from Discussions
└── can be Validated via Evaluations

Resource
└── belongs to Objective (never standalone)

Concept
├── links to Paths, Modules, Learning Objectives, Projects
├── connects to Ideas (conversations)
└── can be Validated via Evaluations

Ideas (conversations)
├── links to Objectives, Projects, Concepts
├── can spawn from Discussions
└── can mature into Paths

Project
├── links to Objectives
├── links to Ideas (conversations)
└── contains Notes, Todos, Links
```

**Key principle:** Entities don't exist in isolation. A Resource without an Learning Objective is meaningless. A Concept gains value by connecting multiple Paths.

---

## State Semantics

Use these states consistently:

### Engagement States (Paths, Modules)
| State | Meaning | User Experience |
|-------|---------|-----------------|
| `not_started` | Haven't begun | Neutral, inviting |
| `exploring` | Actively surveying | Curious, discovering |
| `deepening` | Going deeper | Focused, mastering |
| `resting` | Paused, not abandoned | Warm, welcoming return |

**Never use:** "abandoned", "failed", "overdue", "incomplete"

### Depth Levels (Objectives, Resources)
| Level | Meaning |
|-------|---------|
| `survey` | Get the lay of the land |
| `intermediate` | Working knowledge, can apply |
| `deep` | Expert-level, can teach |

---

## AI Integration Guidelines

When building AI-powered features:

### Conversation Design
- Start by understanding context (what does the user already know? I contribute back to knowledge graph about user knowledge)
- Ask before assuming!!!
- Propose, don't prescribe
- Offer multiple paths forward
- Remember previous conversations

### Context Awareness
AI should always know:
- User's current paths and their states
- Recently completed learning objectives
- Open questions being explored
- Current module context

### Output Expectations
AI can:
- Suggest to create new entities (paths, modules, objectives, resources) for the user
- Surface connections (concepts linking disparate areas)
- Propose questions worth exploring
- Validate understanding through dialogue

AI should not:
- Assign work
- Set deadlines
- Evaluate without invitation
- Assume a single "correct" path

---

## UI/UX Principles

### Emotional Tone
The interface should feel like:
- A warm library that knows you
- A patient mentor, not a demanding teacher
- An infinite canvas, not a finite checklist

Use language like:
- "Welcome back, explorer"
- "Your graph is growing"
- "Interesting connection ahead"
- "Rest as long as you need"

Avoid language like:
- "You haven't completed..."
- "X days since last activity"
- "You're behind on..."
- "Deadline approaching"

### Visual Hierarchy
1. **The Graph** — Primary reward, always accessible
2. **Active Explorations** — What you're currently engaged with
3. **Resting Items** — Warm, not cold; inviting, not guilt-inducing
4. **Sparks & Suggestions** — Invitations, easily dismissible

### Interaction Patterns
- Expand/collapse for progressive disclosure
- Drag-and-drop for graph manipulation
- Inline editing for quick captures
- Conversational interfaces for AI interaction

---

## Technical Standards

### Data Hooks
Use React Query hooks for all data operations:
```typescript
// Correct
const { data: paths } = useLearningPaths();

// Incorrect - direct Supabase calls in components
const paths = await supabase.from('learning_paths').select();
```

### Type Safety
All entities must be typed via `src/integrations/supabase/types.ts`. Never use `any` for database entities.

### Security
- All tables use Row Level Security (RLS)
- User data scoped via `auth.uid()`
- Public data (like shared concepts) explicitly marked

### Styling
- Use Tailwind semantic tokens from `index.css`
- Never hardcode colors in components
- Support both light and dark modes

---

## Visual Design System

Brainstorm's visual identity is **warm, inviting, and expansive** — reflecting the open-ended nature of learning. The design should feel like a cozy library that knows you, not a sterile productivity app.

### Design Philosophy

| Attribute | Expression |
|-----------|------------|
| **Warm** | Amber accents, cream backgrounds, soft shadows |
| **Inviting** | Generous whitespace, rounded corners, gentle animations |
| **Expansive** | Open layouts, the graph as infinite canvas, no cramped UI |
| **Celebratory** | Nodes pulse when added, connections animate, growth is visible |

### Color Palette

All colors use HSL format and are defined as CSS custom properties in `index.css`. **Never hardcode colors in components.**

#### Semantic Tokens (Required)
```css
/* Always use these for UI elements */
--background       /* Page backgrounds */
--foreground       /* Primary text */
--card             /* Card surfaces */
--muted            /* Subtle backgrounds */
--muted-foreground /* Secondary text */
--primary          /* Amber - primary actions, active states */
--secondary        /* Sage - completion, success states */
--accent           /* Highlights, hover states */
--destructive      /* Errors, deletions (use sparingly) */
```

#### Custom Tokens (Brainstorm-specific)
```css
/* Warm amber family - energy, curiosity, active exploration */
--amber            /* Primary amber */
--amber-light      /* Softer amber for backgrounds */
--amber-glow       /* For glow effects and animations */

/* Sage green family - calm, completion, resting */
--sage             /* Primary sage */
--sage-light       /* Softer sage for backgrounds */
--sage-muted       /* Very subtle sage tints */

/* Accent colors */
--coral            /* Warm accent for variety */
--lavender         /* Cool accent for contrast */

/* Graph node colors */
--node-objective   /* Amber - learning objectives */
--node-project     /* Blue - projects */
--node-idea        /* Purple - ideas */

/* Engagement status colors */
--status-exploring   /* Amber - actively exploring */
--status-deepening   /* Blue - going deeper */
--status-resting     /* Sage - paused, not abandoned */
--status-not-started /* Muted gray - not yet begun */
```

### Typography

```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],      // Body text
  display: ['Cal Sans', 'Inter', 'system-ui'],     // Headings, emphasis
}
```

- Use `font-display` for page titles and important headings
- Body text uses the default `font-sans`
- Maintain generous line-height for readability

### Spacing & Layout

- **Border radius:** Uses `--radius` (0.75rem) for consistent roundedness
- **Container:** Max-width 1400px, centered with 2rem padding
- **Cards:** Subtle shadows, warm backgrounds, comfortable padding
- **Whitespace:** Generous — let content breathe

### Animations

Animations reinforce the reward mechanism. They should feel **satisfying** and **organic**.

#### Available Animations
```typescript
animate-fade-in       // Content appearing (0.4s ease-out)
animate-scale-in      // Emphasis, modals (0.3s ease-out)
animate-pulse-glow    // Active/selected nodes (2s infinite)
animate-node-appear   // New graph nodes (0.5s with scale bounce)
animate-connection-draw // Graph edges drawing in (0.8s)
animate-float         // Subtle floating effect (3s infinite)
```

#### When to Use
| Animation | Use Case |
|-----------|----------|
| `pulse-glow` | Currently selected node, active exploration |
| `node-appear` | New node added to graph (celebratory) |
| `connection-draw` | Edge appearing between nodes |
| `fade-in` | Content loading, page transitions |
| `float` | Curiosity sparks, suggestions |

### Utility Classes

```css
/* Gradients */
.gradient-warm      /* Amber gradient for CTAs, highlights */
.gradient-sage      /* Sage gradient for success states */
.gradient-glow      /* Radial glow for emphasis */

/* Text effects */
.text-gradient-warm /* Gradient text for headings */

/* Glassmorphism */
.glass              /* Frosted glass effect for overlays */

/* Node effects */
.node-glow-objective /* Amber glow for objective nodes */
.node-glow-project   /* Blue glow for project nodes */
.node-glow-idea      /* Purple glow for idea nodes */
```

### Dark Mode

Dark mode uses **warm dark tones**, not pure black:
- Backgrounds: `30 15% 8%` (warm charcoal)
- Reduced contrast for eye comfort
- Amber remains vibrant but slightly desaturated
- Sage shifts to a brighter, more visible tone

### Component Guidelines

#### Cards
- Use `bg-card` for surface, never `bg-white`
- Subtle border with `border-border`
- Shadow: `shadow-sm` (light) or custom warm shadows
- Rounded corners: `rounded-lg` (uses --radius)

#### Buttons
- Primary: Amber background, use for main actions
- Secondary: Sage background, use for success/completion
- Ghost: For toolbar actions, navigation
- Never use red/destructive for anything except actual deletions

#### Status Indicators
- Exploring: Amber dot/badge, pulsing animation
- Deepening: Blue indicator, steady state
- Resting: Sage indicator, calm, inviting return
- Not Started: Muted gray, neutral invitation

#### Empty States
- Warm, encouraging messaging
- Suggest next steps, don't just say "nothing here"
- Use illustrations or icons with amber accents

### Do's and Don'ts

**DO:**
- Use semantic color tokens (`text-muted-foreground`, not `text-gray-500`)
- Add micro-animations for feedback (hover, click, success)
- Celebrate achievements (new nodes, connections, milestones)
- Maintain generous whitespace
- Keep the graph visually engaging

**DON'T:**
- Use harsh reds or warning colors for non-error states
- Create dense, cramped layouts
- Use animations that feel rushed or mechanical
- Hardcode colors anywhere in components
- Forget dark mode support

---

## Adding New Entities

If you're proposing a new entity type:

1. **Write the conceptual description first**
   - What is it?
   - Why does it matter?
   - How does it relate to existing entities?

2. **Update the specification**
   - Add to `docs/SPECIFICATION.md`
   - Include in entity relationship diagram

3. **Consider the graph**
   - Is this a new node type?
   - What edge types connect it?

4. **Plan the AI integration**
   - How does AI discover/suggest this?
   - What context does AI need?

5. **Design the UI**
   - Where does this live in the hierarchy?
   - How is it accessed?
   - What's the emotional tone?
   - Which color family represents this entity?

---

## Pull Request Checklist

Before submitting:

- [ ] Feature supports discovery, not prescription
- [ ] No punishment states or guilt-inducing language
- [ ] Contributes to knowledge graph growth
- [ ] AI interactions are conversational
- [ ] Respects user control over timing and depth
- [ ] Entity relationships preserved
- [ ] State semantics consistent
- [ ] Types properly defined
- [ ] RLS policies in place
- [ ] Specification updated if needed

---

## Questions?

If you're unsure whether a feature fits the philosophy, ask:

> "Does this make the user feel like a curious explorer in an infinite library, or a student with homework due?"

If it's the latter, reconsider the approach.

---

*See `docs/SPECIFICATION.md` for the complete product vision and entity model.*
