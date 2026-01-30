import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock motion/react-client — pass through as plain divs/sections
vi.mock('motion/react-client', () => {
  const handler = {
    get(_target: object, prop: string) {
      // Return a simple component that renders the HTML element
      return ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
        const { initial, animate, transition, whileHover, whileTap, ...domProps } = props as Record<string, unknown>;
        const El = prop as keyof JSX.IntrinsicElements;
        return <El {...(domProps as Record<string, unknown>)}>{children}</El>;
      };
    },
  };
  return new Proxy({}, handler);
});

// Mock AnimatedKnowledgeGraph
vi.mock('@/app/components/landing/AnimatedKnowledgeGraph', () => ({
  AnimatedKnowledgeGraph: () => <div data-testid="animated-knowledge-graph" />,
}));

import DashboardPage from '@/app/(protected)/dashboard/page';

describe('DashboardPage', () => {
  it('renders welcome heading with "explorer" gradient text', () => {
    render(<DashboardPage />);
    const explorer = screen.getByText('explorer');
    expect(explorer).toHaveClass('text-gradient-warm');
  });

  it('renders the "Dashboard" section label with amber color', () => {
    render(<DashboardPage />);
    const label = screen.getByText('Dashboard');
    expect(label.tagName).toBe('P');
    expect(label.className).toContain('uppercase');
    expect(label.className).toContain('text-[var(--amber)]');
  });

  it('renders all 4 stat cards with stat-card-accent class', () => {
    render(<DashboardPage />);
    const statCards = document.querySelectorAll('.stat-card-accent');
    expect(statCards).toHaveLength(4);
  });

  it('each stat card sets --stat-accent custom property', () => {
    render(<DashboardPage />);
    const statCards = document.querySelectorAll('.stat-card-accent');
    statCards.forEach((card) => {
      const style = (card as HTMLElement).style;
      expect(style.getPropertyValue('--stat-accent')).toBeTruthy();
    });
  });

  it('stat cards have shadow-warm and hover classes', () => {
    render(<DashboardPage />);
    const statCards = document.querySelectorAll('.stat-card-accent');
    statCards.forEach((card) => {
      expect(card.className).toContain('shadow-warm');
      expect(card.className).toContain('hover:shadow-warm-lg');
      expect(card.className).toContain('hover:-translate-y-0.5');
    });
  });

  it('renders "Active Explorations" section with CTA button', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Active Explorations')).toBeInTheDocument();
    expect(screen.getByText('Start exploring')).toBeInTheDocument();
  });

  it('renders "Curiosity Sparks" section with expansion and connection cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Curiosity Sparks')).toBeInTheDocument();
    expect(screen.getByText('expansion')).toBeInTheDocument();
    expect(screen.getByText('connection')).toBeInTheDocument();
  });

  it('renders the Knowledge Graph section with AnimatedKnowledgeGraph', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Your Knowledge Graph')).toBeInTheDocument();
    expect(screen.getByTestId('animated-knowledge-graph')).toBeInTheDocument();
  });

  it('renders graph legend with all 4 node types', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Concepts')).toBeInTheDocument();
    expect(screen.getByText('Objectives')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Ideas')).toBeInTheDocument();
  });

  it('renders "Recent Ideas" and "Active Projects" bottom sections', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Recent Ideas')).toBeInTheDocument();
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
  });

  it('CTA button uses gradient-warm class', () => {
    render(<DashboardPage />);
    const cta = screen.getByText('Start exploring').closest('a');
    expect(cta?.className).toContain('gradient-warm');
  });

  it('decorative gradient separator exists after welcome heading', () => {
    render(<DashboardPage />);
    // The gradient separator is an h-px div with a specific gradient
    const separators = document.querySelectorAll('.h-px.bg-gradient-to-r');
    expect(separators.length).toBeGreaterThanOrEqual(1);
  });
});
