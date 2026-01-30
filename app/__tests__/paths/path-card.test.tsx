import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { PathCard } from '@/app/components/paths/PathCard';

const mockPath = {
  id: '123',
  user_id: 'user-1',
  title: 'Machine Learning Basics',
  description: 'An introduction to ML concepts',
  status: 'active',
  created_at: '2026-01-28T00:00:00Z',
  updated_at: '2026-01-29T00:00:00Z',
  modules: [{ id: 'm1' }, { id: 'm2' }],
};

describe('PathCard', () => {
  it('renders path title', () => {
    render(<PathCard path={mockPath} />);
    expect(screen.getByText('Machine Learning Basics')).toBeInTheDocument();
  });

  it('renders path description', () => {
    render(<PathCard path={mockPath} />);
    expect(screen.getByText('An introduction to ML concepts')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<PathCard path={mockPath} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders module count', () => {
    render(<PathCard path={mockPath} />);
    expect(screen.getByText('2 modules')).toBeInTheDocument();
  });

  it('links to path detail page', () => {
    render(<PathCard path={mockPath} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/paths/123');
  });

  it('renders singular "module" for count of 1', () => {
    render(<PathCard path={{ ...mockPath, modules: [{ id: 'm1' }] }} />);
    expect(screen.getByText('1 module')).toBeInTheDocument();
  });

  it('has shadow-warm class for warm elevation', () => {
    render(<PathCard path={mockPath} />);
    const card = screen.getByRole('link').firstChild as HTMLElement;
    expect(card.className).toContain('shadow-warm');
  });
});
