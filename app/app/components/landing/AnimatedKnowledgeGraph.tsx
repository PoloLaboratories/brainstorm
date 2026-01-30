'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ForceGraph, type GraphNode, type GraphEdge } from './ForceGraph';

const nodes: GraphNode[] = [
  { id: 'n1', label: 'Neural Networks', type: 'objective', r: 22 },
  { id: 'n2', label: 'Linear Algebra', type: 'concept', r: 18 },
  { id: 'n3', label: 'ML Project', type: 'project', r: 20 },
  { id: 'n4', label: 'Backpropagation', type: 'objective', r: 17 },
  { id: 'n5', label: 'Hypothesis', type: 'idea', r: 15 },
  { id: 'n6', label: 'Calculus', type: 'concept', r: 16 },
  { id: 'n7', label: 'Data Viz', type: 'project', r: 14 },
  { id: 'n8', label: 'Statistics', type: 'concept', r: 16 },
  { id: 'n9', label: 'Creativity', type: 'idea', r: 13 },
  { id: 'n10', label: 'Optimization', type: 'objective', r: 15 },
  { id: 'n11', label: 'Python', type: 'concept', r: 14 },
  { id: 'n12', label: 'Research', type: 'project', r: 13 },
  { id: 'n13', label: 'Philosophy', type: 'idea', r: 12 },
  { id: 'n14', label: 'Probability', type: 'concept', r: 14 },
];

const edges: GraphEdge[] = [
  { source: 'n1', target: 'n2' },
  { source: 'n1', target: 'n3' },
  { source: 'n1', target: 'n4' },
  { source: 'n4', target: 'n6' },
  { source: 'n4', target: 'n5' },
  { source: 'n3', target: 'n7' },
  { source: 'n3', target: 'n8' },
  { source: 'n2', target: 'n6' },
  { source: 'n5', target: 'n8' },
  { source: 'n9', target: 'n1' },
  { source: 'n2', target: 'n11' },
  { source: 'n10', target: 'n4' },
  { source: 'n10', target: 'n5' },
  { source: 'n12', target: 'n8' },
  { source: 'n12', target: 'n10' },
  { source: 'n13', target: 'n9' },
  { source: 'n13', target: 'n1' },
  { source: 'n14', target: 'n1' },
  { source: 'n14', target: 'n8' },
  { source: 'n14', target: 'n7' },
];

export function AnimatedKnowledgeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 580, h: 420 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: '16/11' }}>
      {/* Ambient glow behind graph */}
      <div
        className="absolute inset-[-25%] blur-3xl pointer-events-none opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 40% 50% at 45% 35%, oklch(0.78 0.16 60 / 0.18), transparent),' +
            'radial-gradient(ellipse 30% 40% at 75% 65%, oklch(0.68 0.16 300 / 0.10), transparent),' +
            'radial-gradient(ellipse 35% 35% at 20% 70%, oklch(0.68 0.14 155 / 0.08), transparent)',
        }}
      />

      {mounted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <ForceGraph
            nodes={nodes}
            edges={edges}
            width={size.w}
            height={size.h}
          />
        </motion.div>
      )}
    </div>
  );
}
