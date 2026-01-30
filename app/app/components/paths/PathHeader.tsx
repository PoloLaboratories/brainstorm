'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Bed, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export function PathHeader({ path }: PathHeaderProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(path.title);
  const [description, setDescription] = useState(path.description ?? '');
  const updatePath = useUpdateLearningPath();
  const deletePath = useDeleteLearningPath();

  function handleSave() {
    if (!title.trim()) return;
    updatePath.mutate(
      { id: path.id, title: title.trim(), description: description.trim() || null },
      { onSuccess: () => setEditing(false) }
    );
  }

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
          {editing ? (
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-display font-bold"
                autoFocus
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this learning path..."
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={!title.trim() || updatePath.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setTitle(path.title); setDescription(path.description ?? ''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={path.status as 'active' | 'resting'} />
              </div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
                {path.title}
              </h1>
              {path.description && (
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed max-w-2xl">
                  {path.description}
                </p>
              )}
            </>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
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
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-[var(--amber)]/30 via-border/40 to-transparent" />
    </div>
  );
}
