import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HintBadgeProps {
  hint: string;
}

export const HintBadge: React.FC<HintBadgeProps> = ({ hint }) => {
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs md:text-sm font-medium border border-blue-200 shadow-sm"
      title="Base verb to conjugate"
    >
      <HelpCircle className="w-3.5 h-3.5" />
      <span>({hint})</span>
    </div>
  );
};
