export default function EvaluationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Evaluations</h1>
        <p className="text-muted-foreground mt-1">
          Validate your understanding through self-assessments.
        </p>
      </div>

      <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-12">
        <p className="text-sm text-muted-foreground">
          No evaluations yet. They will appear as you progress through your learning paths.
        </p>
      </div>
    </div>
  );
}
