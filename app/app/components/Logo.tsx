import { Sparkles } from 'lucide-react';

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Sparkles
      size={size}
      className="text-primary"
      strokeWidth={2}
    />
  );
}
