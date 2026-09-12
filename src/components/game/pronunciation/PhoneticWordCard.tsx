'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PhoneticWordCardProps {
  targetText: string;
  phonetic: string;
  vietnameseMeaning: string;
  focusSound?: string;
  onPlayAudio: (text: string) => void;
}

export function PhoneticWordCard({
  targetText,
  phonetic,
  vietnameseMeaning,
  focusSound,
  onPlayAudio,
}: PhoneticWordCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl shadow-sm text-center space-y-3">
      {focusSound && (
        <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-medium">
          {focusSound}
        </Badge>
      )}
      <div className="flex items-center gap-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {targetText}
        </h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Nghe phát âm mẫu"
          onClick={() => onPlayAudio(targetText)}
          className="rounded-full h-10 w-10 shrink-0"
        >
          <Volume2 className="h-5 w-5 text-primary" />
        </Button>
      </div>
      <p className="text-sm font-mono text-muted-foreground">{phonetic}</p>
      <p className="text-base text-primary/80 font-medium">{vietnameseMeaning}</p>
    </div>
  );
}
