'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Brain,
  GraduationCap,
  Network,
  Lightbulb,
  FolderKanban,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { signOut } from '@/app/actions/auth';

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Learning Paths', href: '/paths', icon: BookOpen },
  { title: 'Concepts', href: '/concepts', icon: Brain },
  { title: 'Evaluations', href: '/evaluations', icon: GraduationCap },
  { title: 'Knowledge Graph', href: '/graph', icon: Network },
  { title: 'Ideas', href: '/ideas', icon: Lightbulb },
  { title: 'Projects', href: '/projects', icon: FolderKanban },
];

export function AppSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-5 pt-7 pb-8">
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl gradient-warm shadow-[0_2px_10px_oklch(0.72_0.15_60/0.35)] transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="h-[18px] w-[18px] text-white" />
            {/* Breathing glow behind logo */}
            <div className="absolute inset-0 rounded-xl bg-[oklch(0.72_0.15_60/0.3)] animate-glow-breathe blur-md -z-10" />
          </div>
          <div>
            <span className="text-base font-display font-bold tracking-tight text-sidebar-accent-foreground">
              Brainstorm
            </span>
            <p className="text-[10px] text-sidebar-foreground/40 leading-tight mt-0.5 tracking-wide">
              The Infinite University
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Gradient separator from header */}
        <div className="h-px mx-5 mb-2 bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent" />

        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/30 px-3 mb-1.5 font-semibold">
            Explore
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-5">
        <div className="h-px mx-2 bg-gradient-to-r from-transparent via-sidebar-border/60 to-transparent mb-4" />
        <SidebarMenu className="mb-3">
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" isActive={pathname.startsWith('/settings')}>
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/40">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sidebar-primary/30 to-sidebar-primary/10 ring-2 ring-sidebar-primary/20 text-sm font-bold text-sidebar-primary shadow-sm">
            {userEmail?.charAt(0).toUpperCase() ?? 'E'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight truncate text-sidebar-accent-foreground">
              Explorer
            </p>
            {userEmail && (
              <p className="text-[10px] text-sidebar-foreground/40 leading-tight truncate mt-0.5">
                {userEmail}
              </p>
            )}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sidebar-foreground/30 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-150 p-1.5"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
