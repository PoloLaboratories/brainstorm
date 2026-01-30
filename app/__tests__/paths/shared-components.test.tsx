import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/app/components/paths/StatusBadge';
import { DepthBadge } from '@/app/components/paths/DepthBadge';
import { EmptyState } from '@/app/components/paths/EmptyState';
import { Compass } from 'lucide-react';

describe('StatusBadge', () => {
  it('renders active status with correct label', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders resting status', () => {
    render(<StatusBadge status="resting" />);
    expect(screen.getByText('Resting')).toBeInTheDocument();
  });

  it('renders exploring status', () => {
    render(<StatusBadge status="exploring" />);
    expect(screen.getByText('Exploring')).toBeInTheDocument();
  });

  it('renders deepening status', () => {
    render(<StatusBadge status="deepening" />);
    expect(screen.getByText('Deepening')).toBeInTheDocument();
  });

  it('renders not_started status', () => {
    render(<StatusBadge status="not_started" />);
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });
});

describe('DepthBadge', () => {
  it('renders survey depth', () => {
    render(<DepthBadge depth="survey" />);
    expect(screen.getByText('Survey')).toBeInTheDocument();
  });

  it('renders intermediate depth', () => {
    render(<DepthBadge depth="intermediate" />);
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
  });

  it('renders deep depth', () => {
    render(<DepthBadge depth="deep" />);
    expect(screen.getByText('Deep')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyState
        icon={Compass}
        title="No paths yet"
        description="Start your first learning journey"
      />
    );
    expect(screen.getByText('No paths yet')).toBeInTheDocument();
    expect(screen.getByText('Start your first learning journey')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <EmptyState icon={Compass} title="Empty" description="Desc">
        <button>Create</button>
      </EmptyState>
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
  });
});
