'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

interface ConceptTagProps {
  conceptId: string;
  name: string;
  onUnlink?: () => void;
}

export function ConceptTag({ conceptId, name, onUnlink }: ConceptTagProps) {
  return (
    <span className="inline-flex items-center gap-1 bg-[var(--node-concept)]/15 text-[var(--node-concept)] text-[11px] px-2 py-0.5 rounded-full">
      <Link
        href={`/concepts/${conceptId}`}
        className="hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {name}
      </Link>
      {onUnlink && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUnlink();
          }}
          className="hover:text-destructive transition-colors ml-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
