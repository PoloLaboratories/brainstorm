import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock motion/react-client
vi.mock('motion/react-client', () => {
  const handler = {
    get(_target: object, prop: string) {
      return ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
        const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props as Record<string, unknown>;
        const El = prop as keyof JSX.IntrinsicElements;
        return <El {...(domProps as Record<string, unknown>)}>{children}</El>;
      };
    },
  };
  return new Proxy({}, handler);
});

// Mock motion/react — needs `motion` proxy + AnimatePresence
vi.mock('motion/react', () => {
  const motionHandler = {
    get(_target: object, prop: string) {
      return ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
        const { initial, animate, exit, transition, whileHover, whileTap, viewport, whileInView, ...domProps } = props as Record<string, unknown>;
        const El = prop as keyof JSX.IntrinsicElements;
        return <El {...(domProps as Record<string, unknown>)}>{children}</El>;
      };
    },
  };
  return {
    motion: new Proxy({}, motionHandler),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock ForceGraph to avoid canvas complexity
vi.mock('@/app/components/landing/ForceGraph', () => ({
  ForceGraph: () => <div data-testid="force-graph" />,
}));

// Mock canvas getContext
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

import { DemoWalkthrough } from '@/app/components/landing/DemoWalkthrough';

describe('DemoWalkthrough', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <DemoWalkthrough open={false} onOpenChange={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders step content when open', () => {
    render(<DemoWalkthrough open={true} onOpenChange={vi.fn()} />);
    // First step should be visible
    expect(screen.getByText(/Next/)).toBeInTheDocument();
  });

  it('Escape key closes the walkthrough', () => {
    const onOpenChange = vi.fn();
    render(<DemoWalkthrough open={true} onOpenChange={onOpenChange} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keyboard handler ignores events from INPUT elements', () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <DemoWalkthrough open={true} onOpenChange={onOpenChange} />
        <input data-testid="test-input" />
      </>
    );

    const input = screen.getByTestId('test-input');
    // Dispatch a native KeyboardEvent from the input element — it will bubble to window
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    input.dispatchEvent(event);
    // The handler should NOT close because target is an INPUT
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('keyboard handler ignores events from TEXTAREA elements', () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <DemoWalkthrough open={true} onOpenChange={onOpenChange} />
        <textarea data-testid="test-textarea" />
      </>
    );

    const textarea = screen.getByTestId('test-textarea');
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    textarea.dispatchEvent(event);
    // Should NOT navigate — space key should be ignored when from textarea
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('renders navigation buttons', () => {
    render(<DemoWalkthrough open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('Back button is disabled on first step', () => {
    render(<DemoWalkthrough open={true} onOpenChange={vi.fn()} />);
    const backBtn = screen.getByText('Back').closest('button');
    expect(backBtn).toBeDisabled();
  });
});
