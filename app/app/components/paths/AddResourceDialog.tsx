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
import { useCreateResource } from '@/lib/hooks/use-resources';

interface AddResourceDialogProps {
  pathId: string;
  objectiveId: string;
  children: React.ReactNode;
}

export function AddResourceDialog({ pathId, objectiveId, children }: AddResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<string>('article');
  const [whyRelevant, setWhyRelevant] = useState('');
  const createResource = useCreateResource(pathId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !whyRelevant.trim()) return;

    createResource.mutate(
      {
        objective_id: objectiveId,
        title: title.trim(),
        url: url.trim(),
        type,
        why_relevant: whyRelevant.trim(),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setUrl('');
          setType('article');
          setWhyRelevant('');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="res-title">Title</Label>
            <Input
              id="res-title"
              placeholder="e.g., 3Blue1Brown Neural Networks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="res-url">URL</Label>
            <Input
              id="res-url"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="book">Book</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="paper">Paper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="res-why">Why this resource matters</Label>
            <Textarea
              id="res-why"
              placeholder="How does this help with the learning objective?"
              value={whyRelevant}
              onChange={(e) => setWhyRelevant(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !url.trim() || !whyRelevant.trim() || createResource.isPending}>
              {createResource.isPending ? 'Adding...' : 'Add Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
