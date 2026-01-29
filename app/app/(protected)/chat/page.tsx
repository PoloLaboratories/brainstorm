export default function ChatPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Chat</h1>
        <p className="text-muted-foreground mt-1">Your AI learning companion.</p>
      </div>
      <div className="p-12 border border-dashed border-border rounded-xl text-center">
        <p className="text-muted-foreground">
          Conversations with your Socratic guide will appear here.
        </p>
      </div>
    </div>
  );
}
