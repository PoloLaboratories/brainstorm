export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 border border-border rounded-lg bg-card">
        <h1 className="text-3xl font-display font-bold mb-6 text-center">
          Welcome to Brainstorm
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Authentication will be implemented in the next task.
        </p>
        <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
          Supabase Auth integration coming soon...
        </div>
      </div>
    </div>
  );
}
