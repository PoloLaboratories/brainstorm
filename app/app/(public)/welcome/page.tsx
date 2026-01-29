import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sage-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-display font-bold mb-6 text-gradient-warm">
            Brainstorm
          </h1>
          <p className="text-2xl text-muted-foreground mb-4">
            The Infinite University
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Learning that never ends. No deadlines, no pressure — just endless exploration
            guided by your curiosity.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-border rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Co-Design Your Path</h3>
            <p className="text-muted-foreground">
              AI helps you discover what you don't know you need to learn through Socratic dialogue.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Build Your Graph</h3>
            <p className="text-muted-foreground">
              Watch your knowledge grow as concepts, projects, and ideas connect across domains.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2">Learn at Your Pace</h3>
            <p className="text-muted-foreground">
              No deadlines, no guilt. Paths can rest and resume whenever curiosity strikes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
