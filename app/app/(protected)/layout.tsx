import { createClient } from '@/lib/supabase/server';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/AppSidebar';
import { PageTransition } from '@/app/components/PageTransition';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user?.email} />
      <SidebarInset>
        <div className="flex-1 px-8 py-8 mx-auto w-full max-w-6xl">
          <PageTransition>{children}</PageTransition>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
