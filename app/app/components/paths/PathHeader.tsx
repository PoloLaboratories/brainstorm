'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Bed, Zap } from 'lucide-react';
import Link from 'next/link';
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
import { StatusBadge } from './StatusBadge';
import { useUpdateLearningPath, useDeleteLearningPath } from '@/lib/hooks/use-learning-paths';
import { Database } from '@/types/database';

type LearningPath = Database['public']['Tables']['learning_paths']['Row'];

interface PathHeaderProps {
  path: LearningPath;
}

function InlineEdit({ value, onSave, className, multiline, placeholder }: { value: string; onSave: (val: string) => void; className?: string; multiline?: boolean; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    const sharedProps = {
      className: `bg-transparent border-b border-[var(--amber)] outline-none w-full ${className ?? ''}`,
      value: draft,
      placeholder: placeholder ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && draft.trim()) { onSave(draft.trim()); setEditing(false); }
        if (e.key === 'Escape') { setDraft(value); setEditing(false); }
      },
      onBlur: () => {
        if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
        setEditing(false);
      },
      autoFocus: true,
    };

    if (multiline) {
      return <textarea {...sharedProps} rows={3} className={`${sharedProps.className} resize-none rounded-md border border-[var(--amber)]/40 px-2 py-1`} />;
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

  return (
    <span className="inline-flex items-center gap-1.5 group/edit">
      <span
        className={`cursor-pointer hover:text-[var(--amber)] transition-colors ${className ?? ''}`}
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

export function PathHeader({ path }: PathHeaderProps) {
  const router = useRouter();
  const updatePath = useUpdateLearningPath();
  const deletePath = useDeleteLearningPath();

  function handleToggleStatus() {
    const newStatus = path.status === 'active' ? 'resting' : 'active';
    updatePath.mutate({ id: path.id, status: newStatus });
  }

  function handleDelete() {
    deletePath.mutate(path.id, {
      onSuccess: () => router.push('/paths'),
    });
  }

  return (
    <div className="space-y-4">
      <Link
        href="/paths"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All paths
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={path.status as 'active' | 'resting'} />
          </div>
          <InlineEdit
            value={path.title}
            onSave={(val) => updatePath.mutate({ id: path.id, title: val })}
            className="text-2xl lg:text-3xl font-display font-bold tracking-tight"
          />
          {path.description ? (
            <div className="mt-1.5 max-w-2xl">
              <InlineEdit
                value={path.description}
                onSave={(val) => updatePath.mutate({ id: path.id, description: val || null })}
                className="text-muted-foreground text-sm leading-relaxed"
                multiline
              />
            </div>
          ) : (
            <div className="mt-1.5 max-w-2xl">
              <InlineEdit
                value=""
                onSave={(val) => updatePath.mutate({ id: path.id, description: val })}
                className="text-muted-foreground text-sm leading-relaxed"
                multiline
                placeholder="+ Add description"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleToggleStatus} title={path.status === 'active' ? 'Rest this path' : 'Resume this path'}>
            {path.status === 'active' ? <Bed className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Delete path">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this learning path?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{path.title}&quot; and all its modules, objectives, and resources. This action cannot be undone.
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

      <div className="h-px bg-gradient-to-r from-[var(--amber)]/30 via-border/40 to-transparent" />
    </div>
  );
}
