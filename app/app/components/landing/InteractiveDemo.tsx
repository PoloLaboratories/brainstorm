'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, BookOpen, Brain, Layers } from 'lucide-react';

const exampleTopics = [
  'machine learning',
  'quantum physics',
  'creative writing',
  'systems design',
  'music theory',
];

const demoResponse = {
  greeting:
    "Great choice! Let me help you explore machine learning. I've researched curricula from MIT, Stanford, and Coursera to co-design a path that fits you...",
  modules: [
    { name: 'Mathematical Foundations', objectives: 3, depth: 'survey', icon: Brain },
    { name: 'Supervised Learning', objectives: 5, depth: 'intermediate', icon: BookOpen },
    { name: 'Neural Networks', objectives: 4, depth: 'deep', icon: Layers },
  ],
};

export function InteractiveDemo() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [topicIndex, setTopicIndex] = useState(0);

  useEffect(() => {
    if (submitted) return;

    const topic = exampleTopics[topicIndex];
    let charIndex = 0;
    setTypedPlaceholder('');

    const typeInterval = setInterval(() => {
      if (charIndex <= topic.length) {
        setTypedPlaceholder(topic.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setTopicIndex((prev) => (prev + 1) % exampleTopics.length);
        }, 2000);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, [topicIndex, submitted]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) {
      setInput(exampleTopics[topicIndex]);
    }
    setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
    setInput('');
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Chat container */}
      <div className="rounded-2xl overflow-hidden border border-border/50 shadow-warm-lg bg-card">
        {/* Title bar */}
        <div className="px-5 py-3 border-b border-border/50 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-coral/60" />
            <div className="size-2.5 rounded-full bg-amber/60" />
            <div className="size-2.5 rounded-full bg-sage/60" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Brainstorm AI Co-Designer
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Input area */}
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <Sparkles className="size-4 text-amber shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`I want to learn ${typedPlaceholder}${submitted ? '' : '|'}`}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                disabled={submitted}
              />
              {!submitted && (
                <button
                  type="submit"
                  className="p-2 rounded-lg gradient-warm text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Send className="size-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Response */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                {/* AI message */}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg gradient-warm shrink-0 mt-0.5">
                    <Sparkles className="size-3.5 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {demoResponse.greeting}
                  </p>
                </div>

                {/* Suggested modules */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="ml-9"
                >
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                    Your Learning Path
                  </p>
                  <div className="space-y-2">
                    {demoResponse.modules.map((mod, i) => {
                      const Icon = mod.icon;
                      return (
                        <motion.div
                          key={mod.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.15 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-amber/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-amber-light/40">
                              <Icon className="size-3.5 text-amber" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{mod.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {mod.objectives} objectives
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                              mod.depth === 'survey'
                                ? 'bg-sage-muted text-sage'
                                : mod.depth === 'intermediate'
                                  ? 'bg-amber-light/50 text-amber'
                                  : 'bg-lavender/15 text-lavender'
                            }`}
                          >
                            {mod.depth}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Reset */}
                <div className="text-center pt-1">
                  <button
                    onClick={handleReset}
                    className="text-xs text-muted-foreground hover:text-amber transition-colors"
                  >
                    Try another topic
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
