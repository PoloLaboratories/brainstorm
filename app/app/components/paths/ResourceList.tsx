'use client';

import { useState } from 'react';
import { ExternalLink, Trash2, Video, FileText, BookOpen, GraduationCap, ScrollText, CheckCircle2, Circle, Pencil } from 'lucide-react';
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

function InlineEdit({ value, onSave, className, multiline, placeholder }: { value: string; onSave: (val: string) => void; className?: string; multiline?: boolean; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    const isNew = !value && !!placeholder;
    const sharedProps = {
      className: `bg-transparent border-b border-[var(--amber)] outline-none w-full ${className ?? ''}`,
      value: draft,
      placeholder: placeholder ? 'Why is this relevant...' : '',
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
      return <textarea {...sharedProps} rows={2} className={`${sharedProps.className} resize-none rounded-md border border-[var(--amber)]/40 px-2 py-1`} />;
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

const RESOURCE_TYPES = ['video', 'article', 'book', 'course', 'paper'] as const;

const TYPE_LABELS: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  book: 'Book',
  course: 'Course',
  paper: 'Paper',
};

function ResourceTypeBadge({ type, onChange }: { type: string; onChange?: (next: string) => void }) {
  const [open, setOpen] = useState(false);
  const label = TYPE_LABELS[type] ?? type;
  const Icon = TYPE_ICONS[type] ?? FileText;

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:opacity-80 transition-opacity cursor-pointer"
      >
        <Icon className="h-2.5 w-2.5" />
        {label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 rounded-md border bg-popover shadow-md py-1 min-w-[120px]">
            {RESOURCE_TYPES.map((t) => {
              const TIcon = TYPE_ICONS[t] ?? FileText;
              return (
                <button
                  key={t}
                  onClick={() => { onChange(t); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-2 ${
                    t === type ? 'opacity-50' : ''
                  }`}
                >
                  <TIcon className="h-3 w-3" />
                  {TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface ResourceListProps {
  resources: Resource[];
  pathId: string;
  readOnly?: boolean;
  onAllReviewed?: () => void;
  onUnreviewed?: () => void;
}

export function ResourceList({ resources, pathId, readOnly, onAllReviewed, onUnreviewed }: ResourceListProps) {
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
          } else if (onUnreviewed) {
            onUnreviewed();
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
        const locked = readOnly || resource.reviewed;
        return (
          <div
            key={resource.id}
            className={`flex items-start gap-3 rounded-lg p-3 group transition-colors ${
              resource.reviewed ? 'bg-[var(--status-resting)]/8' : 'bg-muted/30'
            }`}
          >
            <button
              onClick={() => handleToggleReviewed(resource)}
              className="mt-0.5 shrink-0 transition-colors"
              title={resource.reviewed ? 'Mark as unread' : 'Mark as reviewed'}
            >
              {resource.reviewed ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--status-resting)]" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 hover:text-[var(--amber)]" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {locked ? (
                  <span className={`text-sm font-medium ${resource.reviewed ? 'line-through opacity-60' : ''}`}>{resource.title}</span>
                ) : (
                  <InlineEdit
                    value={resource.title}
                    onSave={(val) => updateResource.mutate({ id: resource.id, title: val })}
                    className="text-sm font-medium"
                  />
                )}
                <ResourceTypeBadge
                  type={resource.type}
                  onChange={locked ? undefined : (next) => updateResource.mutate({ id: resource.id, type: next })}
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
              </div>
              <div className="flex items-start gap-1.5 mt-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 shrink-0 mt-px">URL:</span>
                {locked ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground leading-relaxed break-all hover:text-[var(--amber)] transition-colors">
                    {resource.url}
                  </a>
                ) : (
                  <InlineEdit
                    value={resource.url}
                    onSave={(val) => updateResource.mutate({ id: resource.id, url: val })}
                    className="text-xs text-muted-foreground leading-relaxed break-all"
                  />
                )}
              </div>
              {(resource.why_relevant || !locked) && (
                <div className="flex items-start gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 shrink-0 mt-px">Why:</span>
                  {locked ? (
                    <span className="text-xs text-muted-foreground leading-relaxed">{resource.why_relevant}</span>
                  ) : resource.why_relevant ? (
                    <InlineEdit
                      value={resource.why_relevant}
                      onSave={(val) => updateResource.mutate({ id: resource.id, why_relevant: val })}
                      className="text-xs text-muted-foreground leading-relaxed"
                    />
                  ) : (
                    <InlineEdit
                      value=""
                      onSave={(val) => updateResource.mutate({ id: resource.id, why_relevant: val })}
                      className="text-xs text-muted-foreground leading-relaxed"
                      placeholder="+ Add why it's relevant"
                    />
                  )}
                </div>
              )}
            </div>
            {!locked && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8 p-0"
                onClick={() => deleteResource.mutate(resource.id)}
                title="Remove resource"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
