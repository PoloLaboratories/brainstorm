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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateObjective } from '@/lib/hooks/use-objectives';

interface CreateObjectiveDialogProps {
  pathId: string;
  moduleId: string;
  children: React.ReactNode;
}

export function CreateObjectiveDialog({ pathId, moduleId, children }: CreateObjectiveDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [depth, setDepth] = useState<string>('survey');
  const createObjective = useCreateObjective(pathId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createObjective.mutate(
      {
        module_id: moduleId,
        title: title.trim(),
        description: description.trim() || null,
        depth_level: depth,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
          setDepth('survey');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Learning Objective</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="obj-title">Title</Label>
            <Input
              id="obj-title"
              placeholder="e.g., Understand backpropagation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obj-description">Description (optional)</Label>
            <Textarea
              id="obj-description"
              placeholder="What specifically should you learn?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Depth Level</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="survey">Survey — get the lay of the land</SelectItem>
                <SelectItem value="intermediate">Intermediate — working knowledge</SelectItem>
                <SelectItem value="deep">Deep — expert-level mastery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createObjective.isPending}>
              {createObjective.isPending ? 'Adding...' : 'Add Objective'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
