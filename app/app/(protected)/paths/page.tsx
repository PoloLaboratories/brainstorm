export default function PathsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Learning Paths</h1>
        <p className="text-muted-foreground mt-1">All your learning journeys in one place.</p>
      </div>
      <div className="p-12 border border-dashed border-border rounded-xl text-center">
        <p className="text-muted-foreground">
          No learning paths yet. Start a conversation with AI to co-design your first path.
        </p>
      </div>
    </div>
  );
}
