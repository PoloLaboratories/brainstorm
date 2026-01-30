export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Projects</h1>
        <p className="text-muted-foreground mt-1">
          Build and create while learning — projects linked to your knowledge graph.
        </p>
      </div>

      <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-12">
        <p className="text-sm text-muted-foreground">
          No active projects. Start one to put your learning into practice.
        </p>
      </div>
    </div>
  );
}
