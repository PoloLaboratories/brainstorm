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
  BookOpen,
  Lightbulb,
  Layers,
  GraduationCap,
  Microscope,
  Hammer,
  Compass,
  Check,
  X,
  Minus,
} from 'lucide-react';
import { AnimatedKnowledgeGraph } from './AnimatedKnowledgeGraph';
import { DemoWalkthrough } from './DemoWalkthrough';
import { InteractiveDemo } from './InteractiveDemo';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const philosophyCards = [
  {
    icon: <Clock className="size-6" />,
    title: 'No Deadlines',
    description:
      'Paths rest when you do. No failure states, no "overdue" warnings. Return whenever curiosity calls.',
  },
  {
    icon: <Network className="size-6" />,
    title: 'Everything Connects',
    description:
      'Concepts, projects, and ideas form a living knowledge graph. Watch connections emerge across domains.',
  },
  {
    icon: <MessageCircle className="size-6" />,
    title: 'Discovery First',
    description:
      'AI guides through Socratic dialogue — asking questions, not assigning homework. You discover what you need to learn.',
  },
];

const comparisonRows = [
  {
    feature: 'Structure',
    course: 'Fixed, pre-built curriculum',
    notes: 'You build everything manually',
    brainstorm: 'AI co-designs with you through dialogue',
  },
  {
    feature: 'Content',
    course: 'Pre-recorded courses',
    notes: 'Your personal notes',
    brainstorm: 'Curated resources matched to your goals',
  },
  {
    feature: 'Completion',
    course: 'Certificate at the end',
    notes: 'Never "done" (by nature)',
    brainstorm: 'Never "done" (by design)',
  },
  {
    feature: 'Projects',
    course: 'Assignments within course',
    notes: 'Separate tool needed',
    brainstorm: 'Integrated, linked to learning objectives',
  },
  {
    feature: 'AI Role',
    course: 'None or basic Q&A',
    notes: 'Plugins available',
    brainstorm: 'Core co-designer and Socratic guide',
  },
  {
    feature: 'Knowledge Graph',
    course: 'None',
    notes: 'Backlinks between notes',
    brainstorm: 'Full graph across all entities',
  },
];

const features = [
  {
    icon: <MessageCircle className="size-6" />,
    title: 'AI Co-Design',
    description:
      'Your curriculum emerges through conversation. The AI researches courses, books, and papers to build paths tailored to you.',
  },
  {
    icon: <Network className="size-6" />,
    title: 'Knowledge Graph',
    description:
      'Every concept, project, and idea connects visually. See how calculus links to neural networks links to your art project.',
  },
  {
    icon: <Lightbulb className="size-6" />,
    title: 'Open Questions',
    description:
      'Capture hypotheses and unresolved curiosities. They can spark new discussions or grow into entire learning paths.',
  },
  {
    icon: <Layers className="size-6" />,
    title: 'Infinite Depth',
    description:
      'Survey, intermediate, or deep — every objective has depth levels. Go as far as your curiosity takes you.',
  },
];

const personas = [
  {
    icon: <GraduationCap className="size-8 text-amber" />,
    title: 'Lifelong Learners',
    quote: 'I never stop exploring. Brainstorm grows with me.',
  },
  {
    icon: <Microscope className="size-8 text-node-project" />,
    title: 'Researchers',
    quote: 'Open questions and hypotheses are first-class citizens here.',
  },
  {
    icon: <Hammer className="size-8 text-node-idea" />,
    title: 'Builders',
    quote: 'I learn in service of projects. Everything connects to what I build.',
  },
  {
    icon: <Compass className="size-8 text-node-concept" />,
    title: 'Curious Minds',
    quote: 'I follow rabbit holes without guilt. Every tangent is welcome.',
  },
];

export function LandingContent() {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <span className="font-display font-bold text-lg">Brainstorm</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">
                The Infinite University
              </p>
              <h1 className="text-5xl lg:text-6xl font-display font-bold mb-6 text-gradient-warm leading-tight">
                Learning That Never Ends
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                No deadlines, no pressure — just endless exploration guided by
                your curiosity. AI co-designs your learning path through Socratic
                dialogue, and your knowledge graph grows with every connection.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/login">Start Exploring</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setWalkthroughOpen(true)}
                >
                  See How It Works
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatedKnowledgeGraph />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              A Different Philosophy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Brainstorm treats learning as a journey, not a destination. No
              grades, no deadlines — just a warm library that knows you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {philosophyCards.map((card, i) => (
              <motion.div
                key={card.title}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="group p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-3 rounded-lg bg-amber-light/50 w-fit mb-4 group-hover:bg-amber-light transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              How Brainstorm Compares
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not a course platform. Not a note-taking app. Something new.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="overflow-x-auto rounded-xl border border-border"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Course Platforms
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Note-Taking Apps
                  </th>
                  <th className="text-left p-4 font-medium text-primary">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-4" />
                      Brainstorm
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-muted-foreground">{row.course}</td>
                    <td className="p-4 text-muted-foreground">{row.notes}</td>
                    <td className="p-4 text-foreground font-medium bg-amber-light/20">
                      {row.brainstorm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Built for Curious Minds
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every feature supports discovery, not prescription.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border shadow-sm"
              >
                <div className="p-3 rounded-lg bg-amber-light/50 w-fit mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-glow opacity-30 pointer-events-none" />
        <div className="container mx-auto max-w-5xl relative">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Try It Yourself
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how AI co-designs a learning path from a simple goal.
            </p>
          </motion.div>

          <motion.div {...fadeUp}>
            <InteractiveDemo />
          </motion.div>
        </div>
      </section>

      {/* Personas */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Built for the Curious
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re a researcher, builder, or lifelong learner —
              Brainstorm adapts to how you explore.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, i) => (
              <motion.div
                key={persona.title}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border shadow-sm text-center"
              >
                <div className="mb-4 flex justify-center">{persona.icon}</div>
                <h3 className="font-display font-semibold mb-2">
                  {persona.title}
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;{persona.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 gradient-warm">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4 text-primary-foreground">
              Ready to Explore?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Your infinite library awaits. No deadlines, no pressure — just
              curiosity.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-8"
              asChild
            >
              <Link href="/login">Start Your Journey</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span className="font-display font-semibold">Brainstorm</span>
              <span className="text-sm text-muted-foreground ml-2">
                Learning never ends
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Walkthrough Modal */}
      <DemoWalkthrough
        open={walkthroughOpen}
        onOpenChange={setWalkthroughOpen}
      />
    </div>
  );
}
