# Brainstorm — The Infinite University

## Specification Document


---

## 1. Philosophy & Vision

Brainstorm reimagines learning as an **endless journey** rather than a destination. Unlike traditional course platforms with completion percentages and deadlines, LearPath celebrates curiosity, supports rabbit holes, and treats knowledge as a living, growing graph.

### Core Principles

1. **Learning Never Ends** — Paths are never "complete"; they grow with your curiosity
2. **No Pressure** — No deadlines, no failure states, just engagement and exploration
3. **Everything Connects** — Ideas, projects, and learning objectives form a knowledge graph
4. **Research-Friendly** — First-class support for papers, open questions, and hypotheses
5. **Return Welcomed** — "Resting" isn't failing; pick up where you left off anytime

### Emotional Design

The platform should feel like walking into a warm library that knows you. Key tones:

- "Welcome back, explorer"
- "Your graph is growing beautifully"
- "No rush — this knowledge isn't going anywhere"
- "Interesting rabbit hole ahead..."

---

## 2. Competitive Positioning

### Where Brainstorm Fits

Brainstorm occupies a unique space between **knowledge management tools** (like Obsidian) and **course platforms** (like Udemy/Coursera). It combines the best of both while adding AI-powered curriculum co-design.

### Comparison Matrix

| Aspect | Obsidian | Udemy/Coursera | Brainstorm |
|--------|----------|----------------|------------|
| **Structure** | You create everything manually | Fixed, pre-built curriculum | AI co-designs with you through dialogue |
| **Content** | Your personal notes | Pre-recorded courses | Curated resources tailored to your objectives |
| **Discovery** | Manual linking between notes | Browse a catalog | Socratic dialogue reveals what you need to learn |
| **Completion** | Never "done" (by nature) | Certificate at the end | Never "done" (by design) |
| **Projects** | Separate tool needed | Assignments within course | Integrated, linked to learning objectives |
| **Graph** | Backlinks between notes | None | Full knowledge graph across all entities |
| **AI Role** | Plugins available | None or basic Q&A | Core co-designer and Socratic guide |

### Key Differentiators

**vs. Obsidian / Roam Research / Notion:**
- Learning-first design — not a general-purpose tool adapted for learning
- Curated resources with depth levels, not just notes
- AI actively helps discover what you don't know you don't know
- Evaluations validate understanding, not just note existence

**vs. Udemy / Coursera / Brilliant:**
- No fixed syllabus — paths emerge from your goals
- No deadlines or failure states — "resting" is valid
- Resources are curated pointers, not locked content
- Your knowledge graph grows across all learning, not siloed by course

**vs. Anki / RemNote:**
- Discovery-focused, not just retention
- Projects and ideas are first-class citizens
- Socratic discussions, not just flashcards
- Open questions drive exploration

### Unique Value Proposition

> **"What if Obsidian was built specifically for learning, with an AI tutor who helps you discover what you don't know you don't know?"**

Brainstorm is for:
- **Lifelong learners** who never stop exploring
- **Researchers** who track open questions and hypotheses
- **Builders** who learn in service of projects
- **Curious minds** who follow rabbit holes without guilt

### Adjacent Competitors

| Tool | Similarity | Key Difference |
|------|------------|----------------|
| **Obsidian** | Graph-based, evergreen | Not learning-focused, no AI co-design |
| **Roam Research** | Networked thought | No curriculum structure, no resources |
| **Notion** | Flexible workspace | Too general, no learning primitives |
| **Brilliant.org** | Guided learning | Fixed paths, no user-driven exploration |
| **RemNote** | Spaced repetition + notes | Retention over discovery |
| **Readwise** | Resource collection | No learning objectives or structure |
| **Zotero** | Academic resources | Reference manager, not learning system |

---

## 2. Entity Model

### 2.1 Learning Path

A **Learning Path** is a high-level journey of exploration in a domain.

**Relationships:**

- Has many **Modules**
- Has many **Learning Objectives**
- Has many **Open Questions**
- Has many **Concepts** (via path_concepts)
- Can be linked from **Ideas (conversations)** (when an idea matures into a path)

**Status Semantics:**

- `active` — Currently exploring this path
- `resting` — Paused, not abandoned; can resume anytime

---

### 2.2 Module

A **Module** is a unit of exploration within a path, grouping related objectives.

**Relationships:**

- Belongs to one **Path**
- Has many **Learning Objectives**
- Has many **Open Questions**
- Has many **Prerequisites**
- Has many **Concepts** (via module_concepts)
- Can depend on other **Modules** (via module_dependencies)
- Can be linked from **Ideas (conversations)** (when an idea matures into a module)


**Status Semantics:**

- `not_started` — Haven't begun exploring
- `exploring` — Actively learning, surveying the landscape
- `deepening` — Going deeper, building mastery
- `resting` — Paused this module, will return

---

### 2.3 Learning Objective

A **Learning Objective** is a specific learning goal within a module.

**Relationships:**

- Belongs to one **Module** or a **Learning Path** or a **Project**
- Has many **Resources**
- Can link to **Concepts** (via concept_objectives)
- Can link to **Ideas** (via idea_objectives)
- Can link to **Projects** (via project_objectives)

**Depth Semantics:**

- `survey` — Introductory understanding, get the lay of the land
- `intermediate` — Working knowledge, can apply concepts
- `deep` — Expert-level, can teach others or contribute new ideas

---

### 2.4 Resource

A **Resource** is learning material attached to an objective. Every resource MUST have a what & why it matters for the **Learning Objective**

**Specific Context Examples:**

```json
// For videos
{ "relevantTimestamps": [{"start": "12:30", "end": "25:45", "topic": "Backpropagation"}] }

// For books
{ "relevantChapters": ["Chapter 3: Neural Networks", "Chapter 7: CNNs"] }

// For courses
{ "relevantModules": ["Week 2", "Week 5"] }
```

---

### 2.5 Concept

A **Concept** is a reusable knowledge unit that can span multiple paths, modules, objectives, ideas, and projects.

**Relationships:**

- Links to **Paths** (via path_concepts)
- Links to **Modules** (via module_concepts)
- Links to **Objectives** (via concept_objectives)
- Links to **Ideas** (via idea_concepts)
- Can be **Validated** (via validated_concepts)

**Validation:**
Concepts can be validated through evaluations, indicating demonstrated understanding.

---

### 2.6 Idea

An **Idea** is a thought, hypothesis, question, or connection to explore.

**Relationships:**

- Can link to **Objectives** (via idea_objectives)
- Can link to **Projects** (via idea_projects)
- Can link to **Concepts** (via idea_concepts)
- Has **Messages** (for AI brainstorming conversations)

**Status Semantics:**

- `active` — Being explored
- `archived` — Set aside, not currently relevant
- `matured` — Evolved into a full learning path

**AI Brainstorming:**
Each idea can have an ongoing conversation with AI to develop it further.

---

### 2.7 Project

A **Project** is something being built or created, serving as an information repository.

**Relationships:**

- Has many **Links** (external references)
- Has many **Notes** (project documentation)
- Has many **Todos** (task checklist)
- Has many **Concepts** (via project_concepts)
- Links to **Objectives** (via project_objectives)
- Links to **Ideas** (via idea_projects)

**Source Semantics:**

- `ai` — Suggested by AI during curriculum design
- `community` — Shared by other users (publicly visible)
- `self` — Created by the user

---

### 2.8 Evaluation

An **Evaluation** is a self-assessment to validate understanding.

**Relationships:**

- Has many **Questions**
- Has many **Attempts**
- Has many **Answers**
- Links to one **Learning Objective** or **Concept**

---

### 2.9 Open Question

An **Open Question** is an unresolved curiosity within a module.

Open questions can spark new discussions or even new learning paths.

---

### 2.10 Curiosity Spark

A **Curiosity Spark** is an AI-suggested exploration direction.

**Spark Types:**

- `connection` — Link between existing knowledge areas
- `expansion` — Deeper dive into current topic
- `tangent` — Interesting related area to explore

---

## 3. Knowledge Graph

The **Knowledge Graph** visualizes relationships between all entities.

### 3.1 Node Types

| Type      | Icon | Color   | Represents               |
| --------- | ---- | ------- | ------------------------ |
| objective | 🎯   | Amber   | Learning objectives      |
| project   | 🔨   | Blue    | Projects being built     |
| idea      | 💡   | Violet  | Ideas and hypotheses     |
| concept   | 🧠   | Emerald | Reusable knowledge units |

### 3.2 Edge Relationships

| Relationship | Meaning                                       |
| ------------ | --------------------------------------------- |
| prerequisite | A must be understood before B                 |
| enables      | Understanding A unlocks B                     |
| relates      | A and B are connected conceptually            |
| same_concept | A and B represent the same underlying concept |

### 3.3 Graph Storage

| Table                | Purpose                            |
| -------------------- | ---------------------------------- |
| graph_edges          | Stores relationships between nodes |
| graph_node_positions | Persists user's node arrangement   |

### 3.4 Graph Views

1. **Force-Directed** — Organic, physics-based layout showing clusters
2. **Tree View** — Hierarchical view of dependencies
3. **Timeline View** — When knowledge was added (planned)

---

## 4. AI Integration

Brainstorm uses a **single persistent conversational interface** with intelligent routing to specialized agents based on user intent.

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────┐
│       Persistent Conversational UI                  │
│       (Always present, context-aware)               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Router Agent (ai-chat)                             │
│  - Analyzes user intent                             │
│  - Maintains conversation context                   │
│  - Routes to specialized agents                     │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│   Curriculum     │  │    Resource      │
│   Co-Design      │  │   Collection     │
│  (conversational)│  │ (conversational) │
└──────────────────┘  └──────────────────┘

┌─────────────────────────────────────────────────────┐
│  Utility Functions (non-conversational)             │
├─────────────────┬──────────────┬────────────────────┤
│ Curiosity Spark │ Open Question│    Evaluation      │
│   Generator     │  Generator   │ Generate & Grade   │
└─────────────────┴──────────────┴────────────────────┘
```

### 4.2 Router Agent (Edge Function: `ai-chat`)

**Purpose:** Single entry point for all AI conversations

**Responsibilities:**

- Detect user intent from conversation
- Route to specialized agents when needed
- Handle general questions directly
- Maintain full conversation history
- Understand current context (active path, module, objectives)

**Intent Detection Examples:**

| User Message | Detected Intent | Action |
|--------------|----------------|--------|
| "I want to learn machine learning" | Curriculum design | Route to co-design agent |
| "Help me find resources for neural networks" | Resource gathering | Route to collection agent |
| "What's the difference between supervised and unsupervised learning?" | General Q&A | Answer directly |
| "Can you explain this open question?" | Discussion | Engage in Socratic dialogue |

### 4.3 Curriculum Co-Design Agent

**Purpose:** Guide users from goals to structured learning paths through Socratic questioning

**Core Capabilities:**

1. **Deep Research on Existing Curricula**
   - Search platforms: Coursera, EdX, Udemy, MIT OpenCourseWare, Harvard Free Courses
   - Analyze curriculum structures, syllabi, learning sequences
   - Extract common patterns across high-quality courses
   - Find prerequisite chains and module dependencies

2. **Socratic Guidance**
   - Ask clarifying questions about goals, background, time commitment
   - Reveal what users don't know they need to learn
   - Guide through depth levels (survey → intermediate → deep)
   - Propose rather than prescribe

3. **Curriculum Synthesis**
   - Create paths with modules and objectives
   - Suggest prerequisites between modules
   - Link related concepts across topics
   - Generate open questions for exploration

**Flow:**

1. User expresses learning goal
2. Agent asks clarifying questions (background, goals, constraints)
3. Agent researches existing curricula (not shown to user)
4. Agent proposes learning objectives incrementally
5. User accepts, modifies, or rejects
6. Agent creates path structure in database

**Research Sources:**

- Major MOOC platforms (Coursera, EdX, Udemy)
- Academic institutions (MIT OCW, Harvard, Stanford Online)
- Industry certifications and learning paths
- Blog posts from domain experts
- Community-curated curricula (GitHub awesome lists, roadmaps)

### 4.4 Resource Collection Agent

**Purpose:** Find and curate the best resources for specific learning objectives

**Core Capabilities:**

1. **Deep Resource Research**
   - Search across multiple resource types (videos, articles, books, courses, papers)
   - Evaluate quality, relevance, and pedagogical value
   - Match resources to depth levels (survey, intermediate, deep)
   - Extract specific context (chapters, timestamps, modules)

2. **Intelligent Filtering**
   - Consider user's current knowledge level
   - Prioritize accessibility (free > paid, beginner-friendly for survey level)
   - Diverse learning modalities (visual, textual, interactive)
   - Up-to-date resources for rapidly evolving fields

3. **Resource Metadata**
   - Why this resource matters for the objective
   - Specific sections/chapters/timestamps relevant
   - Estimated time commitment
   - Prerequisites needed

**Flow:**

1. Router detects resource request for an objective
2. Agent analyzes objective and user's depth level
3. Agent researches best resources (not shown during search)
4. Agent presents curated list with rationale
5. User selects resources to add

**Research Sources:**

- YouTube (lectures, tutorials, explainers)
- Academic papers (arXiv, Google Scholar)
- Books (O'Reilly, Manning, academic publishers)
- Interactive platforms (Brilliant, freeCodeCamp)
- Documentation and official guides
- High-quality blog posts and essays

### 4.5 Utility Functions (Non-Conversational)

These are specialized generation functions, not conversational agents.

#### Curiosity Spark Generator (Edge Function: `generate-sparks`)

**Purpose:** Proactively suggest exploration directions based on user's knowledge graph

**Triggers:**
- After completing a module
- When user views their knowledge graph
- Periodic suggestions based on learning patterns

**Generation Logic:**

1. **Connection Sparks**
   - Analyze concepts across different paths
   - Find unexpected relationships
   - Suggest "You learned X in Path A and Y in Path B—they connect through Z"

2. **Expansion Sparks**
   - Identify objectives marked as "survey" depth
   - Suggest going deeper: "Ready to dive deeper into neural networks?"
   - Reference resources for next depth level

3. **Tangent Sparks**
   - Detect adjacent topics not yet explored
   - Research related fields worth exploring
   - Suggest: "You might find reinforcement learning interesting given your work in supervised learning"

**Output:**
- Spark type (`connection`, `expansion`, `tangent`)
- Description with context
- Optional linked entities (objectives, concepts, paths)

#### Open Question Generator (Edge Function: `generate-questions`)

**Purpose:** Create thought-provoking questions for modules to drive exploration

**Triggers:**
- When creating a new module (auto-generate 2-3 questions)
- User requests more questions for a module
- After completing module objectives (suggest next questions)

**Generation Logic:**
- Analyze module objectives and concepts
- Research current debates/open problems in the domain
- Create questions that:
  - Don't have simple answers (not quiz questions)
  - Invite exploration and discussion
  - Connect to broader themes
  - Can spawn new ideas or paths

**Examples:**
- Module: "Neural Networks Fundamentals"
  - "How do biological neurons differ from artificial ones, and does it matter?"
  - "What types of problems are neural networks fundamentally bad at?"

**Output:**
- Question text
- Optional context/why this matters
- Linked to module

#### Evaluation Utilities (Edge Functions: `generate-evaluation`, `grade-evaluation`)

**Purpose:** Generate and grade assessments

**Capabilities:**

- Generate questions based on objectives/concepts
- Adjust difficulty by depth level
- Grade attempts and provide feedback
- Validate concept understanding

### 4.6 Edge Function Summary

| Function | Type | Purpose | When Called |
|----------|------|---------|-------------|
| `ai-chat` | Router | Main conversation entry point | Every user message |
| `curriculum-design` | Agent | Co-design learning paths | Routed by `ai-chat` |
| `resource-collection` | Agent | Find best resources | Routed by `ai-chat` |
| `generate-sparks` | Utility | Create curiosity sparks | After module completion, graph views |
| `generate-questions` | Utility | Create open questions | New modules, on-demand |
| `generate-evaluation` | Utility | Create assessments | On-demand for objectives/concepts |
| `grade-evaluation` | Utility | Grade attempts | After user submits answers |

### 4.7 Conversation Persistence

All conversations are stored in the `ai_messages` table, linked to:
- User (`user_id`)
- Optional context (`path_id`, `module_id`, `objective_id`, `idea_id`)
- Agent type (`router`, `curriculum_design`, `resource_collection`)

This enables:
- Resuming conversations across sessions
- Context-aware responses based on user history
- Learning from past interactions

---

## 5. Design System

### 5.1 Color Tokens

All colors use HSL via CSS variables:

```css
--primary: /* Main action color */
--secondary: /* Supporting color */
--muted: /* Subdued elements */
--accent: /* Highlights */
--destructive: /* Danger actions */
```

### 5.2 Status Colors

| Status      | Color Intent    |
| ----------- | --------------- |
| not_started | Muted/gray      |
| exploring   | Amber/warm      |
| deepening   | Blue/focused    |
| resting     | Sage/calm       |
| completed   | Emerald/success |

### 5.3 Typography

- Warm, readable fonts
- Generous line heights
- Encouraging, non-pressuring copy

### 5.4 Motion

- Framer Motion for animations
- Pulse effects for new graph nodes
- Smooth transitions between states
