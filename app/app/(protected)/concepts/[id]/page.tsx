'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as motion from 'motion/react-client';
import { ArrowLeft, Pencil, Trash2, Brain, BookOpen, Layers, Target, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useConcept, useUpdateConcept, useDeleteConcept, useConceptLinkedEntities, type LinkedEntity } from '@/lib/hooks/use-concepts';

const ease = [0.22, 1, 0.36, 1] as const;

function InlineEdit({ value, onSave, className, multiline, placeholder }: { value: string; onSave: (val: string) => void; className?: string; multiline?: boolean; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    const isNew = !value && !!placeholder;
    const sharedProps = {
      className: `bg-transparent border-b border-[var(--node-concept)] outline-none w-full ${className ?? ''}`,
      value: draft,
      placeholder: placeholder ? 'Description...' : '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          if (isNew && !draft.trim()) return;
          onSave(draft.trim()); setEditing(false);
        }
        if (e.key === 'Escape') { setDraft(value); setEditing(false); }
      },
      onBlur: () => {
        if (isNew && !draft.trim()) { setEditing(false); return; }
        if (draft.trim() !== value) onSave(draft.trim());
        setEditing(false);
      },
      autoFocus: true,
    };

    if (multiline) {
      return (
        <div className="w-full">
          <textarea {...sharedProps} rows={3} className={`${sharedProps.className} resize-none rounded-md border border-[var(--node-concept)]/40 px-2 py-1 block w-full`} />
        </div>
      );
    }
    return <input {...sharedProps} />;
  }

  if (!value && placeholder) {
    return (
      <button
        onClick={() => { setDraft(''); setEditing(true); }}
        className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground mt-1 transition-colors"
      >
        {placeholder}
      </button>
    );
  }

  if (multiline) {
    return (
      <div className="w-full group/edit">
        <div
          className={`cursor-pointer hover:text-[var(--node-concept)] transition-colors ${className ?? ''}`}
          onClick={() => { setDraft(value); setEditing(true); }}
        >
          {value}
          <Pencil
            className="inline-block ml-1.5 h-3 w-3 text-muted-foreground/0 group-hover/edit:text-muted-foreground/60 transition-colors cursor-pointer"
            onClick={() => { setDraft(value); setEditing(true); }}
          />
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 group/edit">
      <span
        className={`cursor-pointer hover:text-[var(--node-concept)] transition-colors ${className ?? ''}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        {value}
      </span>
      <Pencil
        className="h-3 w-3 text-muted-foreground/0 group-hover/edit:text-muted-foreground/60 transition-colors cursor-pointer shrink-0"
        onClick={() => { setDraft(value); setEditing(true); }}
      />
    </span>
  );
}

function LinkedEntitySection({
  icon: Icon,
  title,
  entities,
  emptyText,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  entities: LinkedEntity[];
  emptyText: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--node-concept)]" />
        <h2 className="text-lg font-display font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">({entities.length})</span>
      </div>
      {entities.length > 0 ? (
        <div className="space-y-1">
          {entities.map((e) => (
            <Link
              key={e.id}
              href={e.href}
              className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors"
            >
              <span className="text-sm">{e.title}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/60 pl-6">{emptyText}</p>
      )}
    </motion.div>
  );
}

export default function ConceptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: concept, isLoading, error } = useConcept(id);
  const { data: linked } = useConceptLinkedEntities(id);
  const updateConcept = useUpdateConcept();
  const deleteConcept = useDeleteConcept();

  function handleDelete() {
    deleteConcept.mutate(id, {
      onSuccess: () => router.push('/concepts'),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-3 mt-8">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !concept) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm">
            {error ? 'Failed to load this concept.' : 'Concept not found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="space-y-8 max-w-4xl"
    >
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/concepts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All concepts
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--node-concept)]">
                <Brain className="h-3.5 w-3.5" />
                Concept
              </span>
            </div>
            <InlineEdit
              value={concept.name}
              onSave={(val) => updateConcept.mutate({ id: concept.id, name: val })}
              className="text-2xl lg:text-3xl font-display font-bold tracking-tight"
            />
            {concept.description ? (
              <div className="mt-1.5">
                <InlineEdit
                  value={concept.description}
                  onSave={(val) => updateConcept.mutate({ id: concept.id, description: val || null })}
                  className="text-muted-foreground text-sm leading-relaxed"
                  multiline
                />
              </div>
            ) : (
              <div className="mt-1.5">
                <InlineEdit
                  value=""
                  onSave={(val) => updateConcept.mutate({ id: concept.id, description: val })}
                  className="text-muted-foreground text-sm leading-relaxed"
                  multiline
                  placeholder="+ Add description"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4 shrink-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" title="Delete concept">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this concept?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{concept.name}&quot; and remove all its links to paths, modules, and objectives. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-[var(--node-concept)]/30 via-border/40 to-transparent" />
      </div>

      {/* Linked Paths */}
      <LinkedEntitySection
        icon={BookOpen}
        title="Linked Paths"
        entities={linked?.paths ?? []}
        emptyText="No paths linked to this concept yet."
        delay={0.15}
      />

      {/* Linked Modules */}
      <LinkedEntitySection
        icon={Layers}
        title="Linked Modules"
        entities={linked?.modules ?? []}
        emptyText="No modules linked to this concept yet."
        delay={0.25}
      />

      {/* Linked Objectives */}
      <LinkedEntitySection
        icon={Target}
        title="Linked Objectives"
        entities={linked?.objectives ?? []}
        emptyText="No objectives linked to this concept yet."
        delay={0.35}
      />
    </motion.div>
  );
}
