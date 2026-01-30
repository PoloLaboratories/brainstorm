'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useConcepts, useLinkConcept, useCreateConcept, type EntityType } from '@/lib/hooks/use-concepts';

interface AddConceptPopoverProps {
  entityType: EntityType;
  entityId: string;
  excludeIds: string[];
}

export function AddConceptPopover({ entityType, entityId, excludeIds }: AddConceptPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: allConcepts } = useConcepts();
  const linkConcept = useLinkConcept();
  const createConcept = useCreateConcept();

  const filtered = (allConcepts ?? []).filter((c) => {
    if (excludeIds.includes(c.id)) return false;
    if (!search) return true;
    return c.name.toLowerCase().includes(search.toLowerCase());
  });

  function handleLink(conceptId: string) {
    linkConcept.mutate({ conceptId, entityType, entityId });
    setOpen(false);
    setSearch('');
  }

  function handleCreateAndLink() {
    if (!search.trim()) return;
    createConcept.mutate(
      { name: search.trim() },
      {
        onSuccess: (newConcept) => {
          linkConcept.mutate({ conceptId: newConcept.id, entityType, entityId });
          setOpen(false);
          setSearch('');
        },
      }
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 bg-[var(--node-concept)]/10 text-[var(--node-concept)] text-[11px] px-2 py-0.5 rounded-full hover:bg-[var(--node-concept)]/20 transition-colors">
          <Plus className="h-3 w-3" />
          Concept
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or create..."
              className="w-full rounded-md bg-muted/50 pl-7 pr-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-[var(--node-concept)]/30"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => handleLink(c.id)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent/50 transition-colors flex items-center justify-between"
              >
                <span className="truncate">{c.name}</span>
              </button>
            ))
          ) : search ? (
            <p className="px-3 py-2 text-[11px] text-muted-foreground">No matching concepts</p>
          ) : (
            <p className="px-3 py-2 text-[11px] text-muted-foreground">No concepts yet</p>
          )}
        </div>
        {search.trim() && (
          <>
            <div className="h-px bg-border/50" />
            <button
              onClick={handleCreateAndLink}
              disabled={createConcept.isPending}
              className="w-full text-left px-3 py-2 text-xs text-[var(--node-concept)] hover:bg-accent/50 transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3 w-3" />
              Create &quot;{search.trim()}&quot;
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
