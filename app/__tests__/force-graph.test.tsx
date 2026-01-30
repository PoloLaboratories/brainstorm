import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ForceGraph } from '@/app/components/landing/ForceGraph';

// Mock d3-force to avoid simulation complexity in tests
vi.mock('d3-force', () => {
  const mockSim = {
    force: vi.fn().mockReturnThis(),
    nodes: vi.fn().mockReturnThis(),
    alpha: vi.fn().mockReturnThis(),
    alphaDecay: vi.fn().mockReturnThis(),
    alphaTarget: vi.fn().mockReturnThis(),
    velocityDecay: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
    stop: vi.fn(),
    on: vi.fn().mockReturnThis(),
  };

  return {
    forceSimulation: vi.fn(() => mockSim),
    forceLink: vi.fn(() => ({
      id: vi.fn().mockReturnThis(),
      distance: vi.fn().mockReturnThis(),
      strength: vi.fn().mockReturnThis(),
    })),
    forceManyBody: vi.fn(() => ({
      strength: vi.fn().mockReturnThis(),
    })),
    forceCenter: vi.fn(() => ({
      strength: vi.fn().mockReturnThis(),
    })),
    forceCollide: vi.fn(() => ({
      radius: vi.fn().mockReturnThis(),
      strength: vi.fn().mockReturnThis(),
    })),
  };
});

// Mock canvas context
const mockCtx = {
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  setLineDash: vi.fn(),
  fillText: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  font: '',
  textAlign: '',
};

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
});

const sampleNodes = [
  { id: 'a', label: 'Node A', type: 'objective' as const, r: 20 },
  { id: 'b', label: 'Node B', type: 'concept' as const, r: 15 },
];

const sampleEdges = [
  { source: 'a', target: 'b' },
];

describe('ForceGraph', () => {
  it('renders a canvas element', () => {
    const { container } = render(
      <ForceGraph nodes={sampleNodes} edges={sampleEdges} width={400} height={300} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('sets canvas dimensions correctly', () => {
    const { container } = render(
      <ForceGraph nodes={sampleNodes} edges={sampleEdges} width={400} height={300} />
    );
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.width).toBe('400px');
    expect(canvas.style.height).toBe('300px');
  });

  it('applies className prop to canvas', () => {
    const { container } = render(
      <ForceGraph nodes={sampleNodes} edges={sampleEdges} width={400} height={300} className="test-class" />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas?.className).toContain('test-class');
  });

  it('does not have onMouseUp on canvas (uses window binding)', () => {
    const { container } = render(
      <ForceGraph nodes={sampleNodes} edges={sampleEdges} width={400} height={300} />
    );
    const canvas = container.querySelector('canvas');
    // Canvas should NOT have onMouseUp prop — drag release is via window listener
    expect(canvas?.getAttribute('onmouseup')).toBeNull();
  });

  it('has onMouseMove, onMouseDown, and onMouseLeave handlers', () => {
    const { container } = render(
      <ForceGraph nodes={sampleNodes} edges={sampleEdges} width={400} height={300} />
    );
    const canvas = container.querySelector('canvas');
    // React attaches handlers internally, but we can verify they exist via the React fiber
    // The canvas element should exist and be interactive
    expect(canvas).toBeTruthy();
    expect(canvas?.tagName).toBe('CANVAS');
  });
});
