import Link from 'next/link';
import { Brain, ArrowRight } from 'lucide-react';

interface ConceptCardProps {
  concept: {
    id: string;
    name: string;
    description: string | null;
    updated_at: string | null;
    concept_objectives: { count: number }[];
    concept_paths: { count: number }[];
    concept_modules: { count: number }[];
  };
}

export function ConceptCard({ concept }: ConceptCardProps) {
  const pathCount = concept.concept_paths[0]?.count ?? 0;
  const moduleCount = concept.concept_modules[0]?.count ?? 0;
  const objectiveCount = concept.concept_objectives[0]?.count ?? 0;

  const updatedAt = concept.updated_at
    ? new Date(concept.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const stats = [
    pathCount > 0 && `${pathCount} ${pathCount === 1 ? 'path' : 'paths'}`,
    moduleCount > 0 && `${moduleCount} ${moduleCount === 1 ? 'module' : 'modules'}`,
    objectiveCount > 0 && `${objectiveCount} ${objectiveCount === 1 ? 'obj' : 'objs'}`,
  ].filter(Boolean);

  return (
    <Link href={`/concepts/${concept.id}`} className="group block">
      <div className="relative rounded-xl bg-card p-5 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 border border-border/30 overflow-hidden">
        {/* Subtle left accent line that reveals on hover */}
        <div
          className="absolute top-0 left-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(180deg, var(--node-concept), transparent)',
          }}
        />

        {updatedAt && (
          <span className="text-[11px] text-muted-foreground block mb-2">
            Updated {updatedAt}
          </span>
        )}

        <h3 className="text-base font-display font-semibold leading-snug mb-1.5 group-hover:text-[var(--node-concept)] transition-colors">
          {concept.name}
        </h3>

        {concept.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {concept.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Brain className="h-3.5 w-3.5" />
            {stats.length > 0 ? stats.join(' \u00b7 ') : 'No links yet'}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-[var(--node-concept)] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
