import React from 'react';
import { VocabularyTerm } from '@/types/reading';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VocabularyTooltipProps {
  term: VocabularyTerm;
  children: React.ReactNode;
}

export function VocabularyTooltip({ term, children }: VocabularyTooltipProps) {
  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger render={
          <span className="cursor-help underline decoration-dashed decoration-primary/50 text-primary hover:bg-primary/10 transition-colors rounded px-0.5 font-medium">
            {children}
          </span>
        } />
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{term.word}</p>
            <p className="text-sm">{term.definition}</p>
            {term.translationVi && (
              <p className="text-sm text-muted-foreground italic">
                {term.translationVi}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
