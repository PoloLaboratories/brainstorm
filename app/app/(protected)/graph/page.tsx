'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as motion from 'motion/react-client';
import { Waypoints, Maximize2, Minimize2 } from 'lucide-react';
import { ForceGraph, type GraphNode, NODE_TYPE_META } from '@/app/components/graph/ForceGraph';
import { useGraphData } from '@/lib/hooks/use-graph';
import { Skeleton } from '@/components/ui/skeleton';

const ease = [0.22, 1, 0.36, 1] as const;

export default function GraphPage() {
  const { nodes, edges, isLoading, error } = useGraphData();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
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
  }, [expanded]);

  // Count nodes by type for legend
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const n of nodes) {
      map[n.type] = (map[n.type] ?? 0) + 1;
    }
    return map;
  }, [nodes]);

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === 'path') {
      router.push(`/paths/${node.id}`);
    }
  };

  const [tooltip, setTooltip] = useState<{ node: GraphNode; x: number; y: number } | null>(null);

  const handleNodeHover = useCallback((node: GraphNode | null, position: { x: number; y: number } | null) => {
    if (node && position) {
      setTooltip({ node, x: position.x, y: position.y });
    } else {
      setTooltip(null);
    }
  }, []);

  const isEmpty = !isLoading && nodes.length === 0;

  return (
    <div className={expanded ? 'fixed inset-0 z-50 bg-background' : ''}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className={expanded ? 'absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-6 pt-4 pb-8 bg-gradient-to-b from-black/60 via-black/30 to-transparent' : 'mb-6'}
      >
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--amber)] mb-3">
            Knowledge Graph
          </p>
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
            Your{' '}
            <span className="text-gradient-warm">constellation</span>
          </h1>
          {!expanded && (
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-lg">
              Watch your knowledge grow and connect. Each node is a piece of your learning journey.
            </p>
          )}
        </div>
        {!isEmpty && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 bg-card hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {expanded ? 'Exit' : 'Expand'}
          </button>
        )}
      </motion.div>

      {!expanded && (
        <div className="h-px bg-gradient-to-r from-[var(--amber)]/30 via-border/40 to-transparent mb-6" />
      )}

      {/* Graph canvas */}
      {isLoading ? (
        <div className="rounded-xl overflow-hidden" style={{ height: expanded ? '100vh' : 'calc(100vh - 280px)', minHeight: 400 }}>
          <Skeleton className="w-full h-full" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm">Failed to load your knowledge graph. Please try again.</p>
        </div>
      ) : isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          className="rounded-xl border border-dashed border-border/50 p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--amber)]/10 mb-4">
            <Waypoints className="h-7 w-7 text-[var(--amber)]" />
          </div>
          <h3 className="text-lg font-display font-semibold mb-2">Your graph awaits</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            As you create learning paths, modules, and objectives, they&apos;ll appear here as an
            interconnected constellation of your knowledge.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          className="relative"
        >
          {/* Graph container */}
          <div
            ref={containerRef}
            className={`relative rounded-xl overflow-hidden bg-[oklch(0.14_0.01_55)] ${expanded ? '' : 'border border-border/30'}`}
            style={{
              height: expanded ? '100vh' : 'calc(100vh - 280px)',
              minHeight: 400,
              ...(expanded ? { borderRadius: 0 } : {}),
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background:
                  'radial-gradient(ellipse 50% 50% at 30% 40%, oklch(0.78 0.16 60 / 0.08), transparent),' +
                  'radial-gradient(ellipse 40% 40% at 70% 60%, oklch(0.68 0.14 25 / 0.06), transparent)',
              }}
            />

            {mounted && size.w > 0 && (
              <ForceGraph
                nodes={nodes}
                edges={edges}
                width={size.w}
                height={size.h}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
              />
            )}

            {/* Legend — bottom-left overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 px-3 py-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
              {Object.entries(NODE_TYPE_META).map(([type, meta]) => {
                const count = counts[type] ?? 0;
                if (count === 0) return null;
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {count} {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Node count — bottom-right */}
            <div className={`absolute bottom-4 ${expanded ? 'right-14' : 'right-4'} px-3 py-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30`}>
              <span className="text-[11px] text-muted-foreground">
                {nodes.length} nodes · {edges.length} connections
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 12,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: NODE_TYPE_META[tooltip.node.type].color }}
            />
            <span className="text-xs font-medium text-foreground">{tooltip.node.label}</span>
          </div>
          <span className="text-[10px] text-muted-foreground capitalize">{tooltip.node.type}</span>
        </div>
      )}
    </div>
  );
}
