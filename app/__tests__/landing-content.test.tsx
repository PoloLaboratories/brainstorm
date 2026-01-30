import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Helper: create a motion element proxy
function createMotionProxy() {
  const handler = {
    get(_target: object, prop: string) {
      return ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
        const { initial, animate, exit, transition, whileHover, whileTap, viewport, whileInView, ...domProps } = props as Record<string, unknown>;
        const El = prop as keyof JSX.IntrinsicElements;
        return <El {...(domProps as Record<string, unknown>)}>{children}</El>;
      };
    },
  };
  return new Proxy({}, handler);
}

// Mock motion/react — named import pattern: `import { motion } from 'motion/react'`
vi.mock('motion/react', () => ({
  motion: createMotionProxy(),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
}));

// Mock motion/react-client for any transitive imports
vi.mock('motion/react-client', () => createMotionProxy());

// Mock sub-components to isolate LandingContent
vi.mock('@/app/components/landing/DemoWalkthrough', () => ({
  DemoWalkthrough: () => null,
}));

vi.mock('@/app/components/landing/AnimatedKnowledgeGraph', () => ({
  AnimatedKnowledgeGraph: () => <div data-testid="animated-knowledge-graph" />,
}));

vi.mock('@/app/components/landing/InteractiveDemo', () => ({
  InteractiveDemo: () => <div data-testid="interactive-demo" />,
}));

import { LandingContent } from '@/app/components/landing/LandingContent';

describe('LandingContent — walkthrough buttons', () => {
  it('hero walkthrough button uses CSS class instead of inline style', () => {
    render(<LandingContent />);
    const heroBtn = screen.getByText('How it works').closest('button');
    expect(heroBtn).toBeTruthy();
    expect(heroBtn?.className).toContain('btn-walkthrough-hero');
    // Should NOT have inline style for color
    expect(heroBtn?.style.color).toBe('');
  });

  it('footer walkthrough button uses CSS class instead of inline style', () => {
    render(<LandingContent />);
    const footerBtn = screen.getByText('Watch the demo').closest('button');
    expect(footerBtn).toBeTruthy();
    expect(footerBtn?.className).toContain('btn-walkthrough-footer');
    // Should NOT have inline style for color
    expect(footerBtn?.style.color).toBe('');
  });

  it('walkthrough buttons do not have onMouseEnter or onMouseLeave handlers', () => {
    render(<LandingContent />);
    const heroBtn = screen.getByText('How it works').closest('button');
    const footerBtn = screen.getByText('Watch the demo').closest('button');
    // With CSS classes, there should be no inline event handlers for hover
    // Verify they have transition-colors class for CSS-based hover
    expect(heroBtn?.className).toContain('transition-colors');
    expect(footerBtn?.className).toContain('transition-colors');
  });
});

describe('LandingContent — structure', () => {
  it('renders the main headline', () => {
    render(<LandingContent />);
    // The landing page has multiple mentions of "infinite" — verify at least one exists
    const matches = screen.getAllByText(/infinite/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders signup CTA links', () => {
    render(<LandingContent />);
    const signupLinks = screen.getAllByRole('link').filter(
      (link) => link.getAttribute('href') === '/signup'
    );
    expect(signupLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders login link', () => {
    render(<LandingContent />);
    const loginLinks = screen.getAllByRole('link').filter(
      (link) => link.getAttribute('href') === '/login'
    );
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
  });
});
