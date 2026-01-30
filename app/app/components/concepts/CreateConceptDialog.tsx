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
import { useCreateConcept } from '@/lib/hooks/use-concepts';

interface CreateConceptDialogProps {
  children: React.ReactNode;
}

export function CreateConceptDialog({ children }: CreateConceptDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createConcept = useCreateConcept();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createConcept.mutate(
      { name: name.trim(), description: description.trim() || null },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
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
          <DialogTitle className="font-display">Create Concept</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="concept-name">Name</Label>
            <Input
              id="concept-name"
              placeholder="e.g., Gradient Descent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="concept-description">Description (optional)</Label>
            <Textarea
              id="concept-description"
              placeholder="What does this concept cover?"
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
              disabled={!name.trim() || createConcept.isPending}
              className="gradient-warm text-primary-foreground border-0"
            >
              {createConcept.isPending ? 'Creating...' : 'Create Concept'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
