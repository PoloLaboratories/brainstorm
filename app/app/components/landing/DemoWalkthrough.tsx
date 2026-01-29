'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  MessageCircle,
  BookOpen,
  Network,
  Lightbulb,
  PartyPopper,
} from 'lucide-react';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
}

const steps: Step[] = [
  {
    icon: <Sparkles className="size-8 text-amber" />,
    title: 'Welcome, Explorer',
    description: 'Tell us what you want to learn',
    detail:
      'Start with a simple goal — "I want to understand machine learning" — and Brainstorm takes it from there.',
  },
  {
    icon: <MessageCircle className="size-8 text-amber" />,
    title: 'Socratic Dialogue',
    description: 'AI asks, you discover',
    detail:
      'Through conversation, the AI helps you uncover what you don\'t know you need to learn. No fixed syllabus — your path emerges from dialogue.',
  },
  {
    icon: <BookOpen className="size-8 text-node-project" />,
    title: 'Co-Design Your Path',
    description: 'Modules, objectives, resources',
    detail:
      'Together you build a learning path with modules and objectives. The AI researches the best resources — books, videos, papers — matched to your depth level.',
  },
  {
    icon: <Lightbulb className="size-8 text-node-idea" />,
    title: 'Capture Ideas',
    description: 'Every spark matters',
    detail:
      'As you learn, capture ideas and open questions. They connect to your graph and can mature into entirely new learning paths.',
  },
  {
    icon: <Network className="size-8 text-node-concept" />,
    title: 'Watch Your Graph Grow',
    description: 'Knowledge connects across domains',
    detail:
      'Concepts, objectives, projects, and ideas form a living knowledge graph. See how calculus connects to neural networks connects to your art project.',
  },
  {
    icon: <PartyPopper className="size-8 text-amber" />,
    title: 'No Finish Line',
    description: 'Rest, explore, return anytime',
    detail:
      'There are no deadlines, no failure states. Paths rest when you do. Pick up exactly where you left off whenever curiosity calls.',
  },
];

interface DemoWalkthroughProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoWalkthrough({ open, onOpenChange }: DemoWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) setCurrentStep(0);
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            How Brainstorm Works
          </DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-amber-light/50">
                {step.icon}
              </div>
              <h3 className="text-lg font-display font-semibold">
                {step.title}
              </h3>
              <p className="text-sm font-medium text-primary">
                {step.description}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.detail}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 py-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`size-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
