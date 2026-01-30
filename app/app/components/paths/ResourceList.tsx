'use client';

import { ExternalLink, Trash2, Video, FileText, BookOpen, GraduationCap, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteResource } from '@/lib/hooks/use-resources';
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
}

export function ResourceList({ resources, pathId }: ResourceListProps) {
  const deleteResource = useDeleteResource(pathId);

  if (resources.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
      {resources.map((resource) => {
        const Icon = TYPE_ICONS[resource.type] ?? FileText;
        return (
          <div
            key={resource.id}
            className="flex items-start gap-3 rounded-lg bg-muted/30 p-3 group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-[var(--amber)] transition-colors inline-flex items-center gap-1"
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
