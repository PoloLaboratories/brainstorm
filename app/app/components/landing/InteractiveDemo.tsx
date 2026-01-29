'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles } from 'lucide-react';

const exampleTopics = [
  'machine learning',
  'quantum physics',
  'creative writing',
  'systems design',
  'music theory',
];

const demoResponse = {
  greeting:
    "Great choice! Let me help you explore machine learning. First, a few questions to understand where you're starting from...",
  modules: [
    { name: 'Mathematical Foundations', objectives: 3, depth: 'survey' },
    { name: 'Supervised Learning', objectives: 5, depth: 'intermediate' },
    { name: 'Neural Networks', objectives: 4, depth: 'deep' },
  ],
};

export function InteractiveDemo() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [topicIndex, setTopicIndex] = useState(0);

  // Typing effect for placeholder
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
        // Pause then move to next topic
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
      {/* Input area */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
          <Sparkles className="size-5 text-primary shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`I want to learn ${typedPlaceholder}${submitted ? '' : '|'}`}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            disabled={submitted}
          />
          {!submitted && (
            <button
              type="submit"
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Send className="size-4" />
            </button>
          )}
        </div>
      </form>

      {/* Response */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* AI message */}
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-light shrink-0">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {demoResponse.greeting}
                </p>
              </div>
            </div>

            {/* Suggested modules */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-card border border-border shadow-sm"
            >
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Suggested Learning Path
              </p>
              <div className="space-y-2">
                {demoResponse.modules.map((mod, i) => (
                  <motion.div
                    key={mod.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{mod.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mod.objectives} objectives
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        mod.depth === 'survey'
                          ? 'bg-sage-muted text-sage'
                          : mod.depth === 'intermediate'
                            ? 'bg-amber-light text-amber'
                            : 'bg-lavender/20 text-lavender'
                      }`}
                    >
                      {mod.depth}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Reset */}
            <div className="text-center">
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Try another topic
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
