'use client';

import { ExternalLink, Trash2, Video, FileText, BookOpen, GraduationCap, ScrollText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteResource, useToggleResourceReviewed } from '@/lib/hooks/use-resources';
import { Database } from '@/types/database';

type Resource = Database['public']['Tables']['resources']['Row'];

const TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  article: FileText,
  book: BookOpen,
  course: GraduationCap,
  paper: ScrollText,
};

interface ResourceListProps {
  resources: Resource[];
  pathId: string;
  onAllReviewed?: () => void;
}

export function ResourceList({ resources, pathId, onAllReviewed }: ResourceListProps) {
  const deleteResource = useDeleteResource(pathId);
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
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-medium hover:text-[var(--amber)] transition-colors inline-flex items-center gap-1 ${
                  resource.reviewed ? 'line-through opacity-60' : ''
                }`}
              >
                {resource.title}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {resource.why_relevant}
              </p>
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
