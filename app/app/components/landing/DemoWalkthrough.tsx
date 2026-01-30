'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Network,
  Lightbulb,
  BookOpen,
  X,
  ArrowRight,
  ArrowLeft,
  Brain,
  Layers,
  Zap,
  Check,
} from 'lucide-react';
import { ForceGraph, type GraphNode, type GraphEdge } from './ForceGraph';

/* ─────────────────────────────────────────────
   Step definitions
   ───────────────────────────────────────────── */
interface Step {
  label: string;
  headline: string;
  sub: string;
}

const steps: Step[] = [
  {
    label: 'Conversation',
    headline: 'Tell the AI what you want to learn.',
    sub: 'Through Socratic dialogue, the AI discovers what you need \u2014 even things you didn\u2019t know you needed.',
  },
  {
    label: 'Co-Design',
    headline: 'Your curriculum takes shape.',
    sub: 'The AI researches real curricula from MIT, Stanford, and Coursera to build a structured path just for you.',
  },
  {
    label: 'Graph',
    headline: 'Watch your knowledge grow.',
    sub: 'Every concept, idea, and objective connects visually. A living, breathing map of your mind.',
  },
  {
    label: 'Explore',
    headline: 'Dive as deep as curiosity takes you.',
    sub: 'Capture sparks, follow rabbit holes, rest when you need to. Your library is infinite.',
  },
];

/* ─────────────────────────────────────────────
   Step 1 — Chat with conclusion
   ───────────────────────────────────────────── */
interface ChatMsg {
  role: 'user' | 'ai';
  text: string;
  delay: number;
  isConclusion?: boolean;
}

const chatMessages: ChatMsg[] = [
  { role: 'user', text: 'I want to learn machine learning', delay: 0 },
  { role: 'ai', text: 'Great choice! What\u2019s your background in math? Have you worked with linear algebra or calculus?', delay: 800 },
  { role: 'user', text: 'Some calculus in college, but it\u2019s been a while', delay: 2200 },
  { role: 'ai', text: 'Perfect \u2014 I\u2019ll include a math refresher. What\u2019s your goal: understanding the theory, or building something practical?', delay: 3600 },
  { role: 'user', text: 'Both! I want to understand it deeply and build a project', delay: 5200 },
  { role: 'ai', text: 'I\u2019ve researched curricula from MIT, Stanford, and fast.ai. Here\u2019s your personalized learning path:', delay: 6600, isConclusion: true },
];

function StepChat({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) { setVisible(0); return; }
    setVisible(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    chatMessages.forEach((msg, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), msg.delay + 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visible]);

  return (
    <div ref={scrollRef} className="w-full max-w-md mx-auto space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
      {chatMessages.map((msg, i) => (
        <AnimatePresence key={i}>
          {i < visible && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber/15 text-white rounded-br-md'
                    : 'border border-white/10 text-white/80 rounded-bl-md'
                }`}
                style={msg.role === 'ai' ? { background: 'oklch(0.22 0.01 55)' } : undefined}
              >
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="size-3 text-amber" />
                    <span className="text-[10px] font-semibold text-amber/70 uppercase tracking-wider">Brainstorm</span>
                  </div>
                )}
                {msg.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Conclusion — path preview */}
      <AnimatePresence>
        {visible >= chatMessages.length && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-start"
          >
            <div
              className="max-w-[90%] rounded-2xl rounded-bl-md border border-amber/20 overflow-hidden"
              style={{ background: 'oklch(0.20 0.01 55)' }}
            >
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="size-3 text-amber" />
                  <span className="text-[10px] font-semibold text-amber/70 uppercase tracking-wider">Your Path</span>
                </div>
              </div>
              {[
                { name: 'Math Refresher', icon: Brain, depth: 'survey', color: 'text-sage' },
                { name: 'Supervised Learning', icon: BookOpen, depth: 'intermediate', color: 'text-amber' },
                { name: 'Neural Networks', icon: Layers, depth: 'deep', color: 'text-lavender' },
              ].map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <motion.div
                    key={mod.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-2.5 px-4 py-2.5 border-t border-white/5"
                  >
                    <div className="size-7 rounded-md bg-white/5 flex items-center justify-center">
                      <Icon className={`size-3.5 ${mod.color}`} />
                    </div>
                    <span className="text-[13px] text-white/80 flex-1">{mod.name}</span>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider ${mod.color}`}>{mod.depth}</span>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="px-4 py-2.5 border-t border-white/5 flex items-center gap-1.5"
              >
                <Check className="size-3 text-sage" />
                <span className="text-[11px] text-sage/70">Path created \u2014 ready to explore</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing indicator while conversation is ongoing */}
      <AnimatePresence>
        {active && visible > 0 && visible < chatMessages.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-md border border-white/10 flex items-center gap-1.5"
              style={{ background: 'oklch(0.22 0.01 55)' }}
            >
              <span className="size-1.5 rounded-full bg-amber/50 animate-pulse" />
              <span className="size-1.5 rounded-full bg-amber/50 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="size-1.5 rounded-full bg-amber/50 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step 2 — Modules appearing
   ───────────────────────────────────────────── */
const modules = [
  { name: 'Math Refresher', objectives: 3, depth: 'survey', icon: Brain, color: 'text-sage' },
  { name: 'Supervised Learning', objectives: 5, depth: 'intermediate', icon: BookOpen, color: 'text-amber' },
  { name: 'Neural Networks', objectives: 4, depth: 'deep', icon: Layers, color: 'text-lavender' },
  { name: 'ML Project', objectives: 2, depth: 'applied', icon: Zap, color: 'text-node-project' },
];

function StepModules({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!active) { setVisible(0); return; }
    setVisible(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    modules.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), 300 + i * 500));
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <div className="size-7 rounded-lg gradient-warm flex items-center justify-center">
          <Sparkles className="size-3.5 text-primary-foreground" />
        </div>
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Your Learning Path</span>
      </motion.div>

      {modules.map((mod, i) => {
        const Icon = mod.icon;
        return (
          <AnimatePresence key={mod.name}>
            {i < visible && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8"
                style={{ background: 'oklch(0.20 0.01 55)' }}
              >
                <div className="size-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Icon className={`size-4 ${mod.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">{mod.name}</p>
                  <p className="text-[11px] text-white/40">{mod.objectives} objectives</p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  mod.depth === 'survey' ? 'bg-sage/15 text-sage'
                    : mod.depth === 'intermediate' ? 'bg-amber/15 text-amber'
                    : mod.depth === 'deep' ? 'bg-lavender/15 text-lavender'
                    : 'bg-node-project/15 text-node-project'
                }`}>
                  {mod.depth}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step 3 — Force graph (incremental)
   ───────────────────────────────────────────── */
const allGraphNodes: (GraphNode & { delay: number })[] = [
  { id: 'a', label: 'Machine Learning', type: 'objective', r: 20, delay: 0 },
  { id: 'b', label: 'Linear Algebra', type: 'concept', r: 15, delay: 1200 },
  { id: 'c', label: 'Project', type: 'project', r: 16, delay: 2200 },
  { id: 'd', label: 'Backprop', type: 'objective', r: 14, delay: 3200 },
  { id: 'e', label: 'Idea', type: 'idea', r: 12, delay: 4200 },
  { id: 'f', label: 'Calculus', type: 'concept', r: 13, delay: 5000 },
  { id: 'g', label: 'Data Viz', type: 'project', r: 11, delay: 6000 },
  { id: 'h', label: 'Statistics', type: 'concept', r: 12, delay: 7000 },
];

const allGraphEdges: (GraphEdge & { delay: number })[] = [
  { source: 'a', target: 'b', delay: 1500 },
  { source: 'a', target: 'c', delay: 2500 },
  { source: 'a', target: 'd', delay: 3500 },
  { source: 'd', target: 'e', delay: 4500 },
  { source: 'd', target: 'f', delay: 5300 },
  { source: 'c', target: 'g', delay: 6300 },
  { source: 'b', target: 'f', delay: 5600 },
  { source: 'c', target: 'h', delay: 7300 },
  { source: 'e', target: 'h', delay: 7800 },
];

const MAX_GRAPH_TICK = 8200; // stop ticking after all items are visible

function StepGraph({ active }: { active: boolean }) {
  const [tick, setTick] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 420, h: 320 });

  useEffect(() => {
    if (!active) { setTick(0); return; }
    setTick(0);
    const t = setInterval(() => {
      setTick(v => {
        const next = v + 100;
        if (next >= MAX_GRAPH_TICK) { clearInterval(t); return MAX_GRAPH_TICK; }
        return next;
      });
    }, 100);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => {
    setMounted(true);
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: Math.round(rect.width), h: Math.round(Math.min(rect.width * 0.75, 340)) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visibleNodes = allGraphNodes.filter(n => tick > n.delay);
  const visibleEdges = allGraphEdges.filter(e => tick > e.delay);

  return (
    <div ref={containerRef} className="w-full max-w-[480px] mx-auto">
      {mounted && visibleNodes.length > 0 && (
        <ForceGraph
          nodes={visibleNodes}
          edges={visibleEdges}
          width={containerSize.w}
          height={containerSize.h}
        />
      )}
      {!mounted || visibleNodes.length === 0 ? (
        <div style={{ height: containerSize.h }} className="flex items-center justify-center">
          <span className="text-white/20 text-sm">Loading graph\u2026</span>
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step 4 — Explore experience
   ───────────────────────────────────────────── */
const exploreItems = [
  { icon: Lightbulb, label: 'New idea captured', sub: '\u201CWhat if neural networks could dream?\u201D', color: 'text-node-idea', delay: 0 },
  { icon: Network, label: 'Connection found', sub: 'Calculus \u2194 Backpropagation', color: 'text-node-concept', delay: 700 },
  { icon: Zap, label: 'Curiosity spark', sub: '\u201CHave you explored reinforcement learning?\u201D', color: 'text-amber', delay: 1400 },
  { icon: BookOpen, label: 'Resource added', sub: '3Blue1Brown \u2014 Neural Networks (Ch. 1\u20134)', color: 'text-node-project', delay: 2100 },
];

function StepExplore({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!active) { setVisible(0); return; }
    setVisible(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    exploreItems.forEach((item, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), item.delay + 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        className="flex items-center justify-between mb-4 px-1"
      >
        <span className="text-xs text-white/40 font-medium">Activity Feed</span>
        <span className="text-[10px] text-amber/60 font-semibold uppercase tracking-wider">Live</span>
      </motion.div>

      {exploreItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <AnimatePresence key={item.label}>
            {i < visible && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-white/8"
                style={{ background: 'oklch(0.20 0.01 55)' }}
              >
                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className={`size-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/85">{item.label}</p>
                  <p className="text-[12px] text-white/40 leading-relaxed">{item.sub}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */
const stepVisuals = [StepChat, StepModules, StepGraph, StepExplore];

interface DemoWalkthroughProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoWalkthrough({ open, onOpenChange }: DemoWalkthroughProps) {
  const [current, setCurrent] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    if (current < steps.length - 1) setCurrent(c => c + 1);
    else { onOpenChange(false); setCurrent(0); }
  }, [current, onOpenChange]);

  const goPrev = useCallback(() => {
    if (current > 0) setCurrent(c => c - 1);
  }, [current]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'Escape') { onOpenChange(false); setCurrent(0); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, goNext, goPrev, onOpenChange]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function handleClose() {
    onOpenChange(false);
    setCurrent(0);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  }

  const step = steps[current];
  const Visual = stepVisuals[current];

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: 'oklch(0.10 0.015 55 / 0.97)' }}
      onClick={handleBackdropClick}
    >
      {/* Close button — top-right */}
      <button
        onClick={handleClose}
        className="absolute top-5 right-5 lg:right-10 size-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
      >
        <X className="size-5" />
      </button>

      {/* ── Content card ── */}
      <div ref={contentRef} className="w-full max-w-lg flex flex-col items-center">
        {/* Step indicator — above the animation */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setCurrent(i)}
              className="flex items-center gap-2"
            >
              <div className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? 'w-8 bg-amber' : i < current ? 'w-4 bg-amber/40' : 'w-4 bg-white/10'
              }`} />
              <span className={`text-xs font-medium transition-colors hidden sm:block ${
                i === current ? 'text-white/80' : 'text-white/25'
              }`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Visual area */}
        <div className="w-full mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Visual active={open} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8"
          >
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight mb-3">
              {step.headline}
            </h3>
            <p className="text-white/45 leading-relaxed max-w-md mx-auto">
              {step.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation — right below text */}
        <div className="flex items-center gap-8">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="flex items-center gap-2 text-sm font-medium text-white/30 hover:text-white/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          <span className="text-xs text-white/20">
            {current + 1} / {steps.length}
          </span>

          <button
            onClick={goNext}
            className="flex items-center gap-2 text-sm font-medium text-amber hover:text-amber/80 transition-colors"
          >
            {current === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
