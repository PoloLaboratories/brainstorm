'use client';

import { motion } from 'motion/react';

interface Node {
  id: string;
  label: string;
  type: 'objective' | 'project' | 'idea' | 'concept';
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

const nodes: Node[] = [
  { id: 'n1', label: 'Neural Networks', type: 'objective', x: 200, y: 80 },
  { id: 'n2', label: 'Linear Algebra', type: 'concept', x: 80, y: 180 },
  { id: 'n3', label: 'ML Project', type: 'project', x: 340, y: 160 },
  { id: 'n4', label: 'Backpropagation', type: 'objective', x: 160, y: 280 },
  { id: 'n5', label: 'What if...?', type: 'idea', x: 320, y: 300 },
  { id: 'n6', label: 'Calculus', type: 'concept', x: 60, y: 340 },
  { id: 'n7', label: 'Data Viz', type: 'project', x: 400, y: 60 },
  { id: 'n8', label: 'Statistics', type: 'concept', x: 420, y: 240 },
];

const edges: Edge[] = [
  { from: 'n1', to: 'n2' },
  { from: 'n1', to: 'n3' },
  { from: 'n1', to: 'n4' },
  { from: 'n4', to: 'n6' },
  { from: 'n4', to: 'n5' },
  { from: 'n3', to: 'n7' },
  { from: 'n3', to: 'n8' },
  { from: 'n2', to: 'n6' },
  { from: 'n5', to: 'n8' },
];

const nodeColors: Record<Node['type'], { fill: string; glow: string }> = {
  objective: { fill: 'var(--node-objective)', glow: 'oklch(0.72 0.15 60 / 0.4)' },
  project: { fill: 'var(--node-project)', glow: 'oklch(0.60 0.12 250 / 0.4)' },
  idea: { fill: 'var(--node-idea)', glow: 'oklch(0.60 0.14 300 / 0.4)' },
  concept: { fill: 'var(--node-concept)', glow: 'oklch(0.60 0.12 155 / 0.4)' },
};

function getNode(id: string): Node {
  return nodes.find((n) => n.id === id)!;
}

export function AnimatedKnowledgeGraph() {
  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto">
      <svg
        viewBox="0 0 480 400"
        className="w-full h-full"
        fill="none"
      >
        {/* Edges */}
        {edges.map((edge, i) => {
          const from = getNode(edge.from);
          const to = getNode(edge.to);
          return (
            <motion.line
              key={`edge-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--border)"
              strokeWidth={1.5}
              strokeOpacity={0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
            />
          );
        })}

        {/* Node glows */}
        {nodes.map((node, i) => {
          const colors = nodeColors[node.type];
          return (
            <motion.circle
              key={`glow-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={28}
              fill={colors.glow}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                scale: { duration: 3, repeat: Infinity, delay: i * 0.4 },
                opacity: { duration: 3, repeat: Infinity, delay: i * 0.4 },
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const colors = nodeColors[node.type];
          return (
            <motion.g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={18}
                fill={colors.fill}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: i * 0.12,
                }}
              />
              <motion.text
                x={node.x}
                y={node.y + 32}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-sans"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.12 }}
              >
                {node.label}
              </motion.text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
