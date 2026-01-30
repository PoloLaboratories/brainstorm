'use client';

import Link from 'next/link';
import * as motion from 'motion/react-client';
import {
  Target,
  BookOpen,
  Lightbulb,
  Flame,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Network,
  FolderKanban,
  Zap,
  Compass,
} from 'lucide-react';
import { AnimatedKnowledgeGraph } from '@/app/components/landing/AnimatedKnowledgeGraph';

/* ── Stat card data ── */
const stats = [
  {
    icon: Target,
    value: '0 / 14',
    label: 'Objectives explored',
    accent: 'var(--amber)',
  },
  {
    icon: BookOpen,
    value: '0',
    label: 'Learning paths',
    accent: 'var(--node-project)',
  },
  {
    icon: Lightbulb,
    value: '0',
    label: 'Ideas captured',
    accent: 'var(--node-idea)',
  },
  {
    icon: Flame,
    value: '0 days',
    label: 'Engagement streak',
    accent: 'var(--coral)',
  },
] as const;

/* ── Ease curve matching landing page ── */
const ease = [0.22, 1, 0.36, 1] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-10 max-w-6xl">
      {/* ═══════════════ Welcome ═══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        {/* Section label */}
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--amber)] mb-3">
          Dashboard
        </p>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
              Welcome back,{' '}
              <span className="text-gradient-warm">explorer</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-lg">
              Your knowledge graph is growing beautifully.
              No rush — this knowledge isn&apos;t going anywhere.
            </p>
          </div>
          <div className="hidden lg:block">
            <Sparkles className="h-10 w-10 text-[var(--amber)] opacity-15 animate-float" />
          </div>
        </div>

        {/* Decorative line */}
        <div className="mt-6 h-px bg-gradient-to-r from-[var(--amber)]/30 via-border/40 to-transparent" />
      </motion.div>

      {/* ═══════════════ Stats ═══════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease }}
            className="stat-card-accent group relative rounded-xl bg-card p-5 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default overflow-hidden"
            style={{ '--stat-accent': stat.accent } as React.CSSProperties}
          >
            {/* Subtle background tint on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle at 30% 30%, color-mix(in oklch, ${stat.accent}, transparent 92%), transparent)` }}
            />

            <div className="relative flex items-center gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.03] transition-transform duration-200 group-hover:scale-110"
                style={{ background: `color-mix(in oklch, ${stat.accent}, transparent 88%)` }}
              >
                <stat.icon className="h-[18px] w-[18px]" style={{ color: stat.accent }} />
              </div>
              <div>
                <p className="text-xl font-display font-bold leading-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════ Two-column: Explorations + Sparks ═══════════════ */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">

        {/* ── Active Explorations ── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold">Active Explorations</h2>
            <Link
              href="/paths"
              className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
              <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Empty state — warm and inviting */}
          <div className="rounded-2xl bg-gradient-to-br from-[var(--amber-light)]/25 via-card to-card p-10 text-center shadow-warm border border-border/30">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--amber-light)] shadow-sm">
                  <Compass className="h-7 w-7 text-[var(--amber)]" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--amber)] animate-pulse-glow" />
              </div>
            </div>
            <p className="text-base font-display font-semibold">No learning paths yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto leading-relaxed">
              Start a conversation to co-design your first learning journey. The AI will guide you.
            </p>
            <Link
              href="/ideas"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 text-sm font-semibold text-primary-foreground gradient-warm rounded-xl shadow-warm hover:shadow-warm-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              Start exploring
            </Link>
          </div>
        </motion.section>

        {/* ── Curiosity Sparks ── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--amber)] animate-float" />
            <h2 className="text-lg font-display font-semibold">Curiosity Sparks</h2>
          </div>

          <div className="space-y-3">
            {/* Expansion spark */}
            <div className="group rounded-xl border-l-[3px] border-l-[var(--amber)] bg-card p-4 space-y-2.5 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[var(--amber)] bg-[var(--amber-light)] px-2.5 py-0.5 rounded-full">
                expansion
              </span>
              <h3 className="text-sm font-medium leading-snug">Begin your learning journey</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create your first learning path to discover what sparks your curiosity.
              </p>
              <Link
                href="/ideas"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-0.5"
              >
                <Lightbulb className="h-3 w-3" />
                Explore this idea
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </Link>
            </div>

            {/* Connection spark */}
            <div className="group rounded-xl border-l-[3px] border-l-[var(--node-concept)] bg-card p-4 space-y-2.5 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200">
              <span
                className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  color: 'var(--node-concept)',
                  background: 'color-mix(in oklch, var(--node-concept), transparent 88%)',
                }}
              >
                connection
              </span>
              <h3 className="text-sm font-medium leading-snug">Find cross-domain connections</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As you explore different paths, unexpected connections will emerge between ideas.
              </p>
              <Link
                href="/graph"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-0.5"
              >
                <Network className="h-3 w-3" />
                Explore this idea
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ═══════════════ Knowledge Graph — LIVE preview ═══════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-semibold">Your Knowledge Graph</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive visualization of your learning connections
            </p>
          </div>
          <Link
            href="/graph"
            className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore Full Graph
            <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="rounded-2xl bg-card overflow-hidden shadow-warm border border-border/30">
          {/* Live animated graph */}
          <div className="relative" style={{ background: 'oklch(0.98 0.005 75)' }}>
            {/* Ambient glow behind graph */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background:
                  'radial-gradient(ellipse 40% 50% at 45% 35%, oklch(0.78 0.16 60 / 0.15), transparent),' +
                  'radial-gradient(ellipse 30% 40% at 75% 65%, oklch(0.68 0.16 300 / 0.08), transparent)',
              }}
            />
            <AnimatedKnowledgeGraph />
          </div>

          {/* Legend bar */}
          <div className="flex items-center gap-6 border-t border-border/40 px-6 py-3 text-[11px] text-muted-foreground bg-muted/20">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--node-concept)]" />
              Concepts
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--node-objective)]" />
              Objectives
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--node-project)]" />
              Projects
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--node-idea)]" />
              Ideas
            </span>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════ Bottom row: Ideas + Projects ═══════════════ */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.55, ease }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[var(--node-idea)]" />
              <h3 className="text-sm font-display font-semibold">Recent Ideas</h3>
            </div>
            <Link href="/ideas" className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all
              <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="rounded-xl bg-card p-7 text-center shadow-warm border border-border/30">
            <div className="flex justify-center mb-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'color-mix(in oklch, var(--node-idea), transparent 88%)' }}
              >
                <Lightbulb className="h-4.5 w-4.5 text-[var(--node-idea)]" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">No ideas captured yet</p>
            <Link href="/ideas" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 mt-3 transition-colors">
              Capture your first idea
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6, ease }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[var(--node-project)]" />
              <h3 className="text-sm font-display font-semibold">Active Projects</h3>
            </div>
            <Link href="/projects" className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all
              <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="rounded-xl bg-card p-7 text-center shadow-warm border border-border/30">
            <div className="flex justify-center mb-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'color-mix(in oklch, var(--node-project), transparent 88%)' }}
              >
                <FolderKanban className="h-4.5 w-4.5 text-[var(--node-project)]" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">No active projects</p>
            <Link href="/projects" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 mt-3 transition-colors">
              Start a project
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
