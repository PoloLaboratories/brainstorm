'use client';

import { useRef, useEffect, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';

/* ── Types ── */
export interface GraphNode {
  id: string;
  label: string;
  type: 'path' | 'module' | 'objective' | 'project' | 'idea' | 'concept';
  r: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

interface SimNode extends SimulationNodeDatum, GraphNode {
  _opacity: number;
  _addedAt: number;
}
interface SimLink extends SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
  _addedAt: number;
}

/* ── Node type metadata (single source of truth) ── */
export const NODE_TYPE_META: Record<GraphNode['type'], { label: string; color: string }> = {
  path:      { label: 'Paths',      color: '#e8a849' },
  module:    { label: 'Modules',    color: '#d4735e' },
  objective: { label: 'Objectives', color: '#e2a336' },
  project:   { label: 'Projects',   color: '#5b8fd9' },
  idea:      { label: 'Ideas',      color: '#b07cd8' },
  concept:   { label: 'Concepts',   color: '#4caf82' },
};

/* Canvas-safe colors — derived from metadata */
const TYPE_COLORS: Record<GraphNode['type'], string> = Object.fromEntries(
  Object.entries(NODE_TYPE_META).map(([k, v]) => [k, v.color])
) as Record<GraphNode['type'], string>;

const TYPE_GLOW_RGBA: Record<GraphNode['type'], [number, number, number, number]> = {
  path: [232, 168, 73, 0.35],
  module: [212, 115, 94, 0.30],
  objective: [226, 163, 54, 0.30],
  project: [91, 143, 217, 0.25],
  idea: [176, 124, 216, 0.25],
  concept: [76, 175, 130, 0.25],
};

const FADE_DURATION = 800;
const DRIFT_INTERVAL = 3000;
const DRIFT_ALPHA = 0.03;

/* ── Props ── */
interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  className?: string;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null, position: { x: number; y: number } | null) => void;
}

/* ── Component ── */
export function ForceGraph({
  nodes,
  edges,
  width,
  height,
  className = '',
  onNodeClick,
  onNodeHover,
}: ForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const nodeMapRef = useRef<Map<string, SimNode>>(new Map());
  const linkSetRef = useRef<Set<string>>(new Set());
  const frameRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const sizeRef = useRef({ w: width, h: height });
  const dragRef = useRef<{ node: SimNode; offsetX: number; offsetY: number } | null>(null);
  const cursorRef = useRef<string>('');
  const onNodeHoverRef = useRef(onNodeHover);
  onNodeHoverRef.current = onNodeHover;

  sizeRef.current = { w: width, h: height };

  /* ── Incremental merge ── */
  useEffect(() => {
    const now = performance.now();
    const existingMap = nodeMapRef.current;
    const existingLinkSet = linkSetRef.current;
    const currentNodes = nodesRef.current;
    const currentLinks = linksRef.current;
    let changed = false;

    for (const n of nodes) {
      if (!existingMap.has(n.id)) {
        let startX = width / 2 + (Math.random() - 0.5) * 60;
        let startY = height / 2 + (Math.random() - 0.5) * 60;

        for (const e of edges) {
          const neighborId = e.source === n.id ? e.target : e.target === n.id ? e.source : null;
          if (neighborId && existingMap.has(neighborId)) {
            const neighbor = existingMap.get(neighborId)!;
            startX = (neighbor.x ?? width / 2) + (Math.random() - 0.5) * 50;
            startY = (neighbor.y ?? height / 2) + (Math.random() - 0.5) * 50;
            break;
          }
        }

        const simNode: SimNode = { ...n, x: startX, y: startY, _opacity: 0, _addedAt: now };
        currentNodes.push(simNode);
        existingMap.set(n.id, simNode);
        changed = true;
      }
    }

    for (const e of edges) {
      const key = `${e.source}->${e.target}`;
      if (!existingLinkSet.has(key) && existingMap.has(e.source) && existingMap.has(e.target)) {
        currentLinks.push({
          source: existingMap.get(e.source)!,
          target: existingMap.get(e.target)!,
          _addedAt: now,
        });
        existingLinkSet.add(key);
        changed = true;
      }
    }

    if (!changed && simRef.current) return;

    const sim = simRef.current;
    if (sim) {
      sim.nodes(currentNodes);
      sim.force(
        'link',
        forceLink<SimNode, SimLink>(currentLinks)
          .id((d) => d.id)
          .distance(90)
          .strength(0.4)
      );
      sim.alpha(0.4).restart();
    } else {
      const newSim = forceSimulation<SimNode>(currentNodes)
        .force(
          'link',
          forceLink<SimNode, SimLink>(currentLinks)
            .id((d) => d.id)
            .distance(90)
            .strength(0.4)
        )
        .force('charge', forceManyBody().strength(-180))
        .force('center', forceCenter(width / 2, height / 2).strength(0.05))
        .force('collide', forceCollide<SimNode>().radius((d) => d.r + 8).strength(0.7))
        .alphaDecay(0.012)
        .velocityDecay(0.35)
        .on('tick', () => {});

      simRef.current = newSim;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      simRef.current?.stop();
      cancelAnimationFrame(frameRef.current);
      nodesRef.current = [];
      linksRef.current = [];
      nodeMapRef.current = new Map();
      linkSetRef.current = new Set();
      simRef.current = null;
    };
  }, []);

  /* ── Update center on resize ── */
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    sim.force('center', forceCenter(width / 2, height / 2).strength(0.05));
    sim.alpha(0.15).restart();
  }, [width, height]);

  /* ── Ambient drift ── */
  useEffect(() => {
    const interval = setInterval(() => {
      const sim = simRef.current;
      if (!sim || dragRef.current) return;
      if (sim.alpha() < 0.01) {
        sim.alpha(DRIFT_ALPHA).restart();
      }
    }, DRIFT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  /* ── Hit-test helper ── */
  const findNodeAt = useCallback((mx: number, my: number): SimNode | null => {
    let closest: SimNode | null = null;
    let minDist = Infinity;
    for (const n of nodesRef.current) {
      if (n.x == null || n.y == null) continue;
      const dx = n.x - mx;
      const dy = n.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < n.r + 12 && dist < minDist) {
        minDist = dist;
        closest = n;
      }
    }
    return closest;
  }, []);

  /* ── Render loop ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = sizeRef.current.w;
    const h = sizeRef.current.h;
    const now = performance.now();

    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }

    const cursor = dragRef.current ? 'grabbing' : hoveredRef.current ? 'grab' : '';
    if (cursorRef.current !== cursor) {
      canvas.style.cursor = cursor;
      cursorRef.current = cursor;
    }

    const ns = nodesRef.current;
    const ls = linksRef.current;
    const hov = hoveredRef.current;
    const dragging = dragRef.current?.node.id ?? null;

    ctx.clearRect(0, 0, bw, bh);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Update opacities
    for (const node of ns) {
      node._opacity = Math.min(1, (now - node._addedAt) / FADE_DURATION);
    }

    // Edges
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (const link of ls) {
      const sx = link.source.x;
      const sy = link.source.y;
      const tx = link.target.x;
      const ty = link.target.y;
      if (sx == null || sy == null || tx == null || ty == null) continue;
      const edgeOpacity = Math.min(1, (now - link._addedAt) / FADE_DURATION) * 0.25;
      const highlight = hov && (link.source.id === hov || link.target.id === hov);
      ctx.strokeStyle = highlight
        ? `rgba(180,170,140,${edgeOpacity * 2})`
        : `rgba(120,110,90,${edgeOpacity})`;
      ctx.lineWidth = highlight ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineWidth = 1;

    // Nodes
    for (const node of ns) {
      const x = node.x;
      const y = node.y;
      if (x == null || y == null || !Number.isFinite(x) || !Number.isFinite(y)) continue;

      const alpha = node._opacity;
      if (alpha <= 0) continue;

      const isHovered = hov === node.id;
      const isDragging = dragging === node.id;
      const r = (isHovered || isDragging) ? node.r * 1.18 : node.r;

      // Glow
      const glowR = r + (isHovered || isDragging ? 22 : 12);
      const [gr, gg, gb, ga] = TYPE_GLOW_RGBA[node.type];
      const glowAlpha = (isHovered || isDragging ? ga * 1.5 : ga) * alpha;
      const glowGrad = ctx.createRadialGradient(x, y, r * 0.4, x, y, glowR);
      glowGrad.addColorStop(0, `rgba(${gr},${gg},${gb},${glowAlpha})`);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = TYPE_COLORS[node.type];
      ctx.globalAlpha = (isHovered || isDragging ? 1 : 0.88) * alpha;
      ctx.fill();

      // Ring on hover/drag
      if (isHovered || isDragging) {
        ctx.strokeStyle = `rgba(255,255,255,${0.2 * alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Label
      ctx.font = `${(isHovered || isDragging) ? '11' : '9'}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = (isHovered || isDragging)
        ? `rgba(230,220,200,${alpha})`
        : `rgba(160,150,130,${0.7 * alpha})`;
      ctx.fillText(node.label, x, y + r + 14);
    }

    ctx.restore();
    frameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  /* ── Mouse interactions ── */
  const getCanvasCoords = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasCoords(e);
      if (!pos) return;

      const drag = dragRef.current;
      if (drag) {
        drag.node.fx = pos.x;
        drag.node.fy = pos.y;
        const sim = simRef.current;
        if (sim && sim.alpha() < 0.1) {
          sim.alpha(0.15).restart();
        }
        return;
      }

      const hit = findNodeAt(pos.x, pos.y);
      const newHovered = hit?.id ?? null;
      if (hoveredRef.current !== newHovered) {
        hoveredRef.current = newHovered;
        if (hit && hit.x != null && hit.y != null) {
          const rect = canvasRef.current?.getBoundingClientRect();
          onNodeHoverRef.current?.(hit, { x: hit.x + (rect?.left ?? 0), y: hit.y + (rect?.top ?? 0) });
        } else {
          onNodeHoverRef.current?.(null, null);
        }
      }
    },
    [getCanvasCoords, findNodeAt]
  );

  const releaseDrag = useCallback(() => {
    const drag = dragRef.current;
    if (drag) {
      drag.node.fx = null;
      drag.node.fy = null;
      dragRef.current = null;
      const sim = simRef.current;
      if (sim) sim.alphaTarget(0);
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasCoords(e);
      if (!pos) return;
      const hit = findNodeAt(pos.x, pos.y);
      if (hit) {
        e.preventDefault();
        hit.fx = hit.x;
        hit.fy = hit.y;
        dragRef.current = { node: hit, offsetX: 0, offsetY: 0 };
        const sim = simRef.current;
        if (sim) sim.alphaTarget(0.2).restart();

        const onWindowUp = () => {
          releaseDrag();
          window.removeEventListener('mouseup', onWindowUp);
        };
        window.addEventListener('mouseup', onWindowUp);
      }
    },
    [getCanvasCoords, findNodeAt, releaseDrag]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onNodeClick) return;
      const pos = getCanvasCoords(e);
      if (!pos) return;
      const hit = findNodeAt(pos.x, pos.y);
      if (hit) onNodeClick(hit);
    },
    [getCanvasCoords, findNodeAt, onNodeClick]
  );

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = null;
    onNodeHoverRef.current?.(null, null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={Math.round(width * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1))}
      height={Math.round(height * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1))}
      style={{ width, height }}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
    />
  );
}
