export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Ideas</h1>
        <p className="text-muted-foreground mt-1">
          Capture thoughts, hypotheses, and connections to explore.
        </p>
      </div>

      <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-12">
        <p className="text-sm text-muted-foreground">
          No ideas captured yet. Start a conversation to brainstorm something new.
        </p>
      </div>
    </div>
  );
}
