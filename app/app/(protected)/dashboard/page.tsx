export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Welcome back, explorer</h1>
        <p className="text-muted-foreground mt-1">Your learning journey continues.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-display font-semibold mb-4">Your Learning Paths</h2>
          <p className="text-sm text-muted-foreground">
            No paths yet. Start a conversation to co-design your first learning journey.
          </p>
        </div>

        <div className="p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-display font-semibold mb-4">Knowledge Graph</h2>
          <p className="text-sm text-muted-foreground">
            Your graph will appear here as you explore and connect ideas.
          </p>
        </div>
      </div>
    </div>
  );
}
