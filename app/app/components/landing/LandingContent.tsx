'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Clock,
  Network,
  MessageCircle,
  Lightbulb,
  Layers,
  GraduationCap,
  Microscope,
  Hammer,
  Compass,
  ArrowRight,
  Play,
  ArrowUpRight,
} from 'lucide-react';
import { AnimatedKnowledgeGraph } from './AnimatedKnowledgeGraph';
import { DemoWalkthrough } from './DemoWalkthrough';
import { InteractiveDemo } from './InteractiveDemo';

/* ── animation presets ── */
const ease = [0.22, 1, 0.36, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease },
};

const revealSlow = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 1, ease },
};

const stagger = (i: number, base = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay: base + i * 0.15, ease },
});

/* ── data ── */
const principles = [
  {
    num: '01',
    icon: <Clock className="size-5" />,
    title: 'No Deadlines',
    copy: 'Paths rest when you do. No failure states, no guilt — return whenever curiosity calls you back.',
    accent: 'var(--amber)',
  },
  {
    num: '02',
    icon: <Network className="size-5" />,
    title: 'Everything Connects',
    copy: 'Concepts, projects, and ideas form a living knowledge graph that grows across every domain you touch.',
    accent: 'var(--node-concept)',
  },
  {
    num: '03',
    icon: <MessageCircle className="size-5" />,
    title: 'AI Co-Designer',
    copy: 'Socratic dialogue reveals what you don\u2019t know you need. No syllabus — paths emerge from conversation.',
    accent: 'var(--node-idea)',
  },
];

const capabilities = [
  {
    icon: <MessageCircle className="size-7" />,
    label: 'Curriculum Co-Design',
    headline: 'Your path, co-designed through conversation.',
    body: 'Tell the AI what you want to learn. It researches curricula from MIT, Stanford, and Coursera — then builds a structured path of modules, objectives, and curated resources matched to your depth level.',
    accent: 'var(--amber)',
    accentClass: 'text-amber',
    bgClass: 'bg-amber/8',
  },
  {
    icon: <Network className="size-7" />,
    label: 'Knowledge Graph',
    headline: 'Watch your knowledge grow.',
    body: 'Every concept, project, idea, and objective connects visually. See how calculus links to neural networks links to your art project — patterns emerge that no syllabus could predict.',
    accent: 'var(--node-concept)',
    accentClass: 'text-node-concept',
    bgClass: 'bg-node-concept/8',
  },
  {
    icon: <Lightbulb className="size-7" />,
    label: 'Open Questions & Ideas',
    headline: 'Capture sparks before they vanish.',
    body: 'Hypotheses, unresolved curiosities, half-formed ideas — all first-class citizens. They connect to your graph and can mature into entire new learning paths.',
    accent: 'var(--node-idea)',
    accentClass: 'text-node-idea',
    bgClass: 'bg-node-idea/8',
  },
  {
    icon: <Layers className="size-7" />,
    label: 'Infinite Depth',
    headline: 'Survey. Intermediate. Deep.',
    body: 'Every objective has depth levels. Go as shallow or as deep as curiosity takes you. Resources, evaluations, and projects all adapt to where you are.',
    accent: 'var(--node-project)',
    accentClass: 'text-node-project',
    bgClass: 'bg-node-project/8',
  },
];

const audiences = [
  {
    icon: <GraduationCap className="size-7" />,
    title: 'Lifelong Learners',
    line: 'Never stop exploring new domains, from quantum physics to watercolor technique.',
    accent: 'var(--amber)',
    accentClass: 'text-amber',
  },
  {
    icon: <Microscope className="size-7" />,
    title: 'Researchers',
    line: 'Track open questions, link hypotheses to concepts, and watch your research graph emerge.',
    accent: 'var(--node-project)',
    accentClass: 'text-node-project',
  },
  {
    icon: <Hammer className="size-7" />,
    title: 'Builders',
    line: 'Learn exactly what your next project demands — no more, no less, always in context.',
    accent: 'var(--node-idea)',
    accentClass: 'text-node-idea',
  },
  {
    icon: <Compass className="size-7" />,
    title: 'Curious Minds',
    line: 'Follow every rabbit hole without guilt. Resting isn\u2019t quitting — it\u2019s breathing.',
    accent: 'var(--node-concept)',
    accentClass: 'text-node-concept',
  },
];

/* ── component ── */
export function LandingContent() {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* ━━━ NAV ━━━ */}
      <nav className="fixed top-0 inset-x-0 z-50">
        <div
          className="px-6 lg:px-10 py-4 flex items-center justify-between"
          style={{
            background: 'oklch(0.12 0.015 55 / 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg gradient-warm flex items-center justify-center shadow-lg shadow-amber/20">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-[17px] text-white tracking-tight">
              Brainstorm
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/8 text-sm"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="gradient-warm text-primary-foreground border-0 text-sm shadow-lg shadow-amber/20"
              asChild
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section className="landing-hero-bg noise-overlay relative overflow-hidden min-h-screen flex flex-col">
        <div className="relative z-10 flex-1 flex items-center pt-20 pb-16 px-6 lg:px-10">
          <div className="w-full max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">
              {/* Copy */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber/20 bg-amber/8 mb-10"
                >
                  <span className="size-1.5 rounded-full bg-amber animate-pulse" />
                  <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'oklch(0.78 0.14 60)' }}>
                    The Infinite University
                  </span>
                </motion.div>

                <h1 className="font-display font-bold leading-[0.95] tracking-tight mb-8">
                  <span className="block text-white text-[clamp(3rem,7vw,5.5rem)]">
                    Learning
                  </span>
                  <span className="block text-gradient-warm text-[clamp(3rem,7vw,5.5rem)]">
                    that never ends.
                  </span>
                </h1>

                <p
                  className="text-[clamp(1.05rem,1.8vw,1.25rem)] leading-relaxed max-w-[520px] mb-12"
                  style={{ color: 'oklch(0.58 0.01 60)' }}
                >
                  AI co-designs your curriculum through Socratic dialogue.
                  Your knowledge graph grows with every connection.
                  No deadlines. No pressure. Just curiosity.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    className="gradient-warm text-primary-foreground border-0 shadow-xl shadow-amber/20 text-[15px] px-8 h-13 rounded-xl"
                    asChild
                  >
                    <Link href="/signup">
                      Start exploring
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <button
                    onClick={() => setWalkthroughOpen(true)}
                    className="btn-walkthrough-hero flex items-center gap-2.5 text-[15px] font-medium transition-colors"
                  >
                    <span className="size-9 rounded-full border border-white/15 flex items-center justify-center">
                      <Play className="size-3.5 ml-0.5" />
                    </span>
                    How it works
                  </button>
                </div>
              </motion.div>

              {/* Graph */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.4, ease }}
                className="hidden lg:block"
              >
                <AnimatedKnowledgeGraph />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Gradient bleed */}
        <div
          className="h-40 relative z-10 shrink-0"
          style={{
            background: 'linear-gradient(to bottom, oklch(0.14 0.015 55) 0%, var(--background) 100%)',
          }}
        />
      </section>

      {/* ━━━ PRINCIPLES — editorial numbered list ━━━ */}
      <section className="py-28 lg:py-36 px-6 bg-background relative overflow-hidden">
        {/* Subtle golden thread accent down the left */}
        <div
          className="absolute left-[8%] top-0 w-px h-full hidden lg:block"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--amber) 30%, var(--amber) 70%, transparent 100%)', opacity: 0.1 }}
        />

        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal} className="max-w-2xl mb-24">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber mb-5">Philosophy</p>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-display font-bold leading-[1.05] tracking-tight">
              A different philosophy
              <br />
              <span className="text-muted-foreground">for a different kind of learner.</span>
            </h2>
          </motion.div>

          <div className="space-y-0">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                {...stagger(i)}
                className="group grid grid-cols-[auto_1fr] gap-8 lg:gap-14 items-start py-12 first:pt-0 last:pb-0"
                style={{ borderBottom: i < principles.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                {/* Large number */}
                <div className="relative">
                  <span
                    className="text-[4.5rem] lg:text-[6rem] font-display font-bold leading-none tracking-tighter opacity-[0.07] select-none"
                  >
                    {p.num}
                  </span>
                  <div
                    className="absolute top-4 left-4 size-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                    style={{ background: `color-mix(in oklch, ${p.accent}, transparent 88%)`, color: p.accent }}
                  >
                    {p.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-3 max-w-lg">
                  <h3 className="text-xl lg:text-2xl font-display font-bold tracking-tight mb-3 group-hover:text-foreground transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    {p.copy}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CAPABILITIES — alternating side-by-side ━━━ */}
      <section className="py-28 lg:py-36 px-6 relative">
        {/* Soft ambient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 50% at 30% 20%, oklch(0.72 0.15 60 / 0.03), transparent), radial-gradient(ellipse 50% 40% at 80% 70%, oklch(0.60 0.14 300 / 0.02), transparent)',
        }} />

        <div className="max-w-6xl mx-auto relative">
          <motion.div {...reveal} className="text-center max-w-2xl mx-auto mb-28">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber mb-5">Capabilities</p>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-display font-bold leading-[1.05] tracking-tight">
              Everything you need
              <br />
              <span className="text-gradient-warm">to explore endlessly.</span>
            </h2>
          </motion.div>

          <div className="space-y-24 lg:space-y-32">
            {capabilities.map((cap, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={cap.label}
                  {...stagger(0, i * 0.1)}
                  className={`group grid lg:grid-cols-2 gap-10 lg:gap-20 items-center ${!isEven ? 'lg:direction-rtl' : ''}`}
                  style={!isEven ? { direction: 'rtl' } : undefined}
                >
                  {/* Visual block */}
                  <div style={!isEven ? { direction: 'ltr' } : undefined}>
                    <div
                      className="relative rounded-2xl p-10 lg:p-14 overflow-hidden transition-shadow duration-500 group-hover:shadow-warm-lg"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in oklch, ${cap.accent}, var(--card) 92%), var(--card))`,
                        border: `1px solid color-mix(in oklch, ${cap.accent}, transparent 82%)`,
                      }}
                    >
                      {/* Decorative accent circle */}
                      <div
                        className="absolute -top-10 -right-10 size-40 rounded-full opacity-[0.06]"
                        style={{ background: cap.accent }}
                      />
                      <div
                        className="size-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                        style={{
                          background: `color-mix(in oklch, ${cap.accent}, transparent 85%)`,
                          color: cap.accent,
                        }}
                      >
                        {cap.icon}
                      </div>
                      <div className="h-px w-12 rounded-full mb-6" style={{ background: cap.accent, opacity: 0.3 }} />
                      <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: cap.accent }}>
                        {cap.label}
                      </p>
                      <h3 className="text-2xl lg:text-3xl font-display font-bold tracking-tight leading-snug">
                        {cap.headline}
                      </h3>
                    </div>
                  </div>

                  {/* Copy block */}
                  <div className="lg:py-8" style={!isEven ? { direction: 'ltr' } : undefined}>
                    <p className="text-muted-foreground leading-[1.75] text-[15px] lg:text-base mb-6">
                      {cap.body}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
                      style={{ color: cap.accent }}
                    >
                      Learn more
                      <ArrowUpRight className="size-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ DEMO — dramatic stage ━━━ */}
      <section className="relative py-28 lg:py-36 px-6 overflow-hidden">
        {/* Rich ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.72 0.15 60 / 0.05), transparent)',
        }} />

        {/* Subtle top/bottom borders */}
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <div className="max-w-6xl mx-auto relative">
          <motion.div {...reveal} className="text-center max-w-xl mx-auto mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber mb-5">Try It</p>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-display font-bold tracking-tight leading-[1.05] mb-5">
              Try it yourself.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Type a learning goal and watch AI co-design your path in seconds.
            </p>
          </motion.div>

          <motion.div {...revealSlow}>
            <InteractiveDemo />
          </motion.div>
        </div>
      </section>

      {/* ━━━ AUDIENCE — bold horizontal strips ━━━ */}
      <section className="py-28 lg:py-36 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div {...reveal} className="text-center max-w-xl mx-auto mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber mb-5">Built For</p>
            <h2 className="text-[clamp(2.2rem,5vw,3.8rem)] font-display font-bold tracking-tight leading-[1.05]">
              For every kind of curious.
            </h2>
          </motion.div>

          <div className="space-y-4">
            {audiences.map((a, i) => (
              <motion.div
                key={a.title}
                {...stagger(i)}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 lg:gap-10 py-7 px-6 lg:px-10 rounded-2xl transition-all duration-500 hover:shadow-warm-lg cursor-default"
                style={{
                  background: `linear-gradient(135deg, color-mix(in oklch, ${a.accent}, var(--card) 95%), var(--card))`,
                  border: `1px solid color-mix(in oklch, ${a.accent}, transparent 85%)`,
                }}
              >
                <div
                  className="size-12 lg:size-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `color-mix(in oklch, ${a.accent}, transparent 85%)`,
                    color: a.accent,
                  }}
                >
                  {a.icon}
                </div>

                <div>
                  <h3 className="text-lg lg:text-xl font-display font-bold tracking-tight mb-0.5">
                    {a.title}
                  </h3>
                  <p className="text-sm lg:text-[15px] text-muted-foreground leading-relaxed">
                    {a.line}
                  </p>
                </div>

                <ArrowUpRight
                  className="size-5 text-muted-foreground/40 transition-all duration-300 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FINAL CTA — cinematic dark close ━━━ */}
      <section className="relative overflow-hidden">
        <div
          className="py-36 lg:py-48 px-6 relative noise-overlay"
          style={{ background: 'oklch(0.12 0.015 55)' }}
        >
          {/* Gradient bleed from light to dark at top */}
          <div
            className="absolute top-0 inset-x-0 h-32 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, var(--background), oklch(0.12 0.015 55))' }}
          />

          {/* Ambient radials */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, oklch(0.78 0.16 60 / 0.06), transparent), radial-gradient(ellipse 40% 40% at 20% 80%, oklch(0.60 0.14 300 / 0.04), transparent), radial-gradient(ellipse 35% 35% at 80% 30%, oklch(0.60 0.12 155 / 0.03), transparent)',
          }} />

          {/* Floating particles */}
          <div className="absolute top-20 left-[15%] size-2 rounded-full bg-amber/20 animate-float" />
          <div className="absolute bottom-24 right-[20%] size-1.5 rounded-full bg-node-concept/20 animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[40%] right-[10%] size-1 rounded-full bg-node-idea/15 animate-float" style={{ animationDelay: '0.8s' }} />
          <div className="absolute bottom-[35%] left-[10%] size-1.5 rounded-full bg-node-project/15 animate-float" style={{ animationDelay: '2.2s' }} />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.div {...revealSlow}>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-xs font-semibold tracking-[0.2em] uppercase mb-8"
                style={{ color: 'oklch(0.78 0.14 60)' }}
              >
                Begin
              </motion.p>

              <h2 className="text-[clamp(2.8rem,7vw,5rem)] font-display font-bold leading-[0.95] tracking-tight mb-8">
                <span className="text-white block">Your infinite library</span>
                <span className="text-gradient-warm block">is waiting.</span>
              </h2>
              <p
                className="text-lg lg:text-xl mb-14 max-w-lg mx-auto leading-relaxed"
                style={{ color: 'oklch(0.48 0.01 60)' }}
              >
                No deadlines. No pressure.
                <br />
                Just curiosity, and a graph that grows with you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="gradient-warm text-primary-foreground border-0 shadow-xl shadow-amber/25 text-[15px] px-9 h-14 rounded-xl"
                  asChild
                >
                  <Link href="/signup">
                    Start your journey
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <button
                  onClick={() => setWalkthroughOpen(true)}
                  className="btn-walkthrough-footer flex items-center gap-2.5 text-[15px] font-medium transition-colors"
                >
                  <span className="size-9 rounded-full border border-white/15 flex items-center justify-center">
                    <Play className="size-3.5 ml-0.5" />
                  </span>
                  Watch the demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER — warm dark, minimal ━━━ */}
      <footer
        className="py-10 px-6 relative"
        style={{ background: 'oklch(0.10 0.015 55)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-md gradient-warm flex items-center justify-center">
              <Sparkles className="size-3 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-sm tracking-tight text-white/70">
              Brainstorm
            </span>
            <span className="text-[11px] ml-1" style={{ color: 'oklch(0.40 0.01 60)' }}>
              &mdash; Learning never ends
            </span>
          </div>
          <div className="flex gap-8 text-[11px]" style={{ color: 'oklch(0.40 0.01 60)' }}>
            {['About', 'Blog', 'Privacy', 'Terms'].map((link) => (
              <Link
                key={link}
                href="#"
                className="hover:text-white/60 transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Walkthrough */}
      <DemoWalkthrough
        open={walkthroughOpen}
        onOpenChange={setWalkthroughOpen}
      />
    </div>
  );
}
