'use client';

import { useEntityConcepts, useUnlinkConcept, type EntityType } from '@/lib/hooks/use-concepts';
import { ConceptTag } from './ConceptTag';
import { AddConceptPopover } from './AddConceptPopover';

interface ConceptTagListProps {
  entityType: EntityType;
  entityId: string;
}

export function ConceptTagList({ entityType, entityId }: ConceptTagListProps) {
  const { data: linked } = useEntityConcepts(entityType, entityId);
  const unlinkConcept = useUnlinkConcept();

  const concepts = (linked ?? [])
    .map((row) => row.concepts)
    .filter(Boolean);

  const excludeIds = concepts.map((c: any) => c.id);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {concepts.map((c: any) => (
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
