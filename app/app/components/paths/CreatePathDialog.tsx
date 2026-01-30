'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateLearningPath } from '@/lib/hooks/use-learning-paths';

interface CreatePathDialogProps {
  children: React.ReactNode;
}

export function CreatePathDialog({ children }: CreatePathDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createPath = useCreateLearningPath();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createPath.mutate(
      { title: title.trim(), description: description.trim() || null },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Create Learning Path</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="path-title">Title</Label>
            <Input
              id="path-title"
              placeholder="e.g., Machine Learning Foundations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="path-description">Description (optional)</Label>
            <Textarea
              id="path-description"
              placeholder="What do you want to explore?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createPath.isPending}
              className="gradient-warm text-primary-foreground border-0"
            >
              {createPath.isPending ? 'Creating...' : 'Create Path'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
