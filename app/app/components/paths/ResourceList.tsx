'use client';

import { useState } from 'react';
import { ExternalLink, Trash2, Video, FileText, BookOpen, GraduationCap, ScrollText, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteResource, useUpdateResource, useToggleResourceReviewed } from '@/lib/hooks/use-resources';
import { Database } from '@/types/database';

type Resource = Database['public']['Tables']['resources']['Row'];

const TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  article: FileText,
  book: BookOpen,
  course: GraduationCap,
  paper: ScrollText,
};

function InlineEdit({ value, onSave, className, multiline }: { value: string; onSave: (val: string) => void; className?: string; multiline?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    const sharedProps = {
      className: `bg-transparent border-b border-[var(--amber)] outline-none w-full ${className ?? ''}`,
      value: draft,
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
      return <textarea {...sharedProps} rows={2} className={`${sharedProps.className} resize-none rounded-md border border-[var(--amber)]/40 px-2 py-1`} />;
    }
    return <input {...sharedProps} />;
  }

  return (
    <span className="inline-flex items-center gap-1 group/edit">
      <span
        className={`cursor-pointer hover:text-[var(--amber)] transition-colors ${className ?? ''}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        {value}
      </span>
      <Pencil
        className="h-2.5 w-2.5 text-muted-foreground/0 group-hover/edit:text-muted-foreground/60 transition-colors cursor-pointer shrink-0"
        onClick={() => { setDraft(value); setEditing(true); }}
      />
    </span>
  );
}

interface ResourceListProps {
  resources: Resource[];
  pathId: string;
  onAllReviewed?: () => void;
}

export function ResourceList({ resources, pathId, onAllReviewed }: ResourceListProps) {
  const deleteResource = useDeleteResource(pathId);
  const updateResource = useUpdateResource(pathId);
  const toggleReviewed = useToggleResourceReviewed(pathId);

  if (resources.length === 0) return null;

  function handleToggleReviewed(resource: Resource) {
    const newReviewed = !resource.reviewed;
    toggleReviewed.mutate(
      { id: resource.id, reviewed: newReviewed },
      {
        onSuccess: () => {
          if (newReviewed) {
            const allOthersReviewed = resources
              .filter((r) => r.id !== resource.id)
              .every((r) => r.reviewed);
            if (allOthersReviewed && onAllReviewed) {
              onAllReviewed();
            }
          }
        },
      }
    );
  }

  const reviewedCount = resources.filter((r) => r.reviewed).length;

  return (
    <div className="space-y-2 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
        <span className="text-[10px] text-muted-foreground">
          {reviewedCount}/{resources.length} reviewed
        </span>
      </div>
      {resources.map((resource) => {
        const Icon = TYPE_ICONS[resource.type] ?? FileText;
        return (
          <div
            key={resource.id}
            className={`flex items-start gap-3 rounded-lg p-3 group transition-colors ${
              resource.reviewed ? 'bg-[var(--status-resting)]/8' : 'bg-muted/30'
            }`}
          >
            <button
              onClick={() => handleToggleReviewed(resource)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                resource.reviewed
                  ? 'bg-[var(--status-resting)]/20 text-[var(--status-resting)]'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              title={resource.reviewed ? 'Mark as unread' : 'Mark as reviewed'}
            >
              {resource.reviewed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1">
                <InlineEdit
                  value={resource.title}
                  onSave={(val) => updateResource.mutate({ id: resource.id, title: val })}
                  className={`text-sm font-medium ${resource.reviewed ? 'line-through opacity-60' : ''}`}
                />
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[var(--amber)] transition-colors shrink-0"
                  title="Open link"
                >
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </span>
              {resource.why_relevant && (
                <InlineEdit
                  value={resource.why_relevant}
                  onSave={(val) => updateResource.mutate({ id: resource.id, why_relevant: val })}
                  className="text-xs text-muted-foreground mt-0.5 leading-relaxed"
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8 p-0"
              onClick={() => deleteResource.mutate(resource.id)}
              title="Remove resource"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
