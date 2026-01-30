'use client';

import { useEntityConcepts, useUnlinkConcept, type EntityType } from '@/lib/hooks/use-concepts';
import { ConceptTag } from './ConceptTag';
import { AddConceptPopover } from './AddConceptPopover';
import { Database } from '@/types/database';

type ConceptRow = Database['public']['Tables']['concepts']['Row'];

interface ConceptTagListProps {
  entityType: EntityType;
  entityId: string;
}

export function ConceptTagList({ entityType, entityId }: ConceptTagListProps) {
  const { data: linked } = useEntityConcepts(entityType, entityId);
  const unlinkConcept = useUnlinkConcept();

  const concepts = (linked ?? [])
    .map((row) => row.concepts as unknown as ConceptRow | null)
    .filter((c): c is ConceptRow => c !== null);

  const excludeIds = concepts.map((c) => c.id);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {concepts.map((c) => (
        <ConceptTag
          key={c.id}
          conceptId={c.id}
          name={c.name}
          onUnlink={() => unlinkConcept.mutate({ conceptId: c.id, entityType, entityId })}
        />
      ))}
      <AddConceptPopover
        entityType={entityType}
        entityId={entityId}
        excludeIds={excludeIds}
      />
    </div>
  );
}
