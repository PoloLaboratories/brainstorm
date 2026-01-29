import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/app/components/LogoutButton';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display font-bold">
            Welcome back, explorer
          </h1>
          <LogoutButton />
        </div>

        <div className="p-6 border border-border rounded-lg bg-card mb-8">
          <p className="text-muted-foreground">
            You're authenticated! User ID: <code className="text-xs bg-muted px-2 py-1 rounded">{user?.id}</code>
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Email: {user?.email}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Your Learning Paths</h2>
            <p className="text-muted-foreground text-sm">
              No paths yet. Start a conversation to co-design your first learning journey.
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Knowledge Graph</h2>
            <p className="text-muted-foreground text-sm">
              Your graph will appear here as you explore and connect ideas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
