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
  usePathname: () => '/dashboard',
}));

// Mock sidebar UI components — render as semantic elements with data attributes
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <nav data-testid="sidebar">{children}</nav>,
  SidebarContent: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
  SidebarFooter: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div data-testid="sidebar-footer" {...props}>{children}</div>,
  SidebarGroup: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <span {...props}>{children}</span>,
  SidebarHeader: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div data-testid="sidebar-header" {...props}>{children}</div>,
  SidebarMenu: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <ul {...props}>{children}</ul>,
  SidebarMenuButton: ({ children, asChild, isActive, ...props }: { children: React.ReactNode; asChild?: boolean; isActive?: boolean; [k: string]: unknown }) => (
    <li data-active={isActive} {...props}>{children}</li>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock auth action
vi.mock('@/app/actions/auth', () => ({
  signOut: vi.fn(),
}));

import { AppSidebar } from '@/app/components/AppSidebar';

describe('AppSidebar', () => {
  it('renders the Brainstorm logo with text', () => {
    render(<AppSidebar userEmail="test@example.com" />);
    expect(screen.getByText('Brainstorm')).toBeInTheDocument();
    expect(screen.getByText('The Infinite University')).toBeInTheDocument();
  });

  it('renders all 6 navigation items', () => {
    render(<AppSidebar />);
    const expectedItems = ['Dashboard', 'Learning Paths', 'Evaluations', 'Knowledge Graph', 'Ideas', 'Projects'];
    expectedItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders Settings nav item', () => {
    render(<AppSidebar />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders sign-out button', () => {
    render(<AppSidebar />);
    const signOutBtn = screen.getByTitle('Sign out');
    expect(signOutBtn).toBeInTheDocument();
  });

  it('renders user email when provided', () => {
    render(<AppSidebar userEmail="test@brainstorm.app" />);
    expect(screen.getByText('test@brainstorm.app')).toBeInTheDocument();
  });

  it('renders avatar with first letter of email', () => {
    render(<AppSidebar userEmail="alice@example.com" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders "Explorer" label in user card', () => {
    render(<AppSidebar userEmail="test@example.com" />);
    expect(screen.getByText('Explorer')).toBeInTheDocument();
  });

  it('logo container has gradient-warm class', () => {
    render(<AppSidebar />);
    const logo = screen.getByText('Brainstorm').closest('a');
    const logoIcon = logo?.querySelector('.gradient-warm');
    expect(logoIcon).toBeTruthy();
  });

  it('logo has breathing glow element', () => {
    render(<AppSidebar />);
    const logo = screen.getByText('Brainstorm').closest('a');
    const glowEl = logo?.querySelector('.animate-glow-breathe');
    expect(glowEl).toBeTruthy();
  });

  it('renders gradient separator dividers', () => {
    render(<AppSidebar />);
    const separators = document.querySelectorAll('.bg-gradient-to-r');
    expect(separators.length).toBeGreaterThanOrEqual(2); // header + footer separators
  });

  it('user card has ring styling', () => {
    render(<AppSidebar userEmail="test@example.com" />);
    const avatar = screen.getByText('T'); // first letter
    expect(avatar.className).toContain('ring-2');
  });

  it('marks Dashboard as active based on pathname', () => {
    render(<AppSidebar />);
    // The Dashboard item should have data-active=true
    const activeItems = document.querySelectorAll('[data-active="true"]');
    expect(activeItems.length).toBeGreaterThanOrEqual(1);
  });
});
