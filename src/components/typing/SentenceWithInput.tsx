import React, { useRef, useEffect } from 'react';
import { HintBadge } from './HintBadge';

interface SentenceWithInputProps {
  textBefore: string;
  textAfter: string;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
  autoFocus?: boolean;
}

export const SentenceWithInput: React.FC<SentenceWithInputProps> = ({
  textBefore,
  textAfter,
  value,
  hint,
  onChange,
  onSubmit,
  disabled = false,
  isCorrect = null,
  autoFocus = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled, textBefore]); // refocus when question changes

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() !== '') {
      onSubmit();
    }
  };

  let inputColorClass = 'border-gray-300 focus:border-blue-500';
  if (isCorrect === true) {
    inputColorClass = 'border-green-500 bg-green-50 text-green-700 focus:border-green-500';
  } else if (isCorrect === false) {
    inputColorClass = 'border-red-500 bg-red-50 text-red-700 focus:border-red-500';
  }

  // To fit the input size approximately to the text
  const inputWidth = Math.max(value.length, 5) + 'ch';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="text-xl md:text-2xl leading-relaxed flex flex-wrap items-center justify-center gap-x-2 gap-y-4">
        <span>{textBefore}</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`border-b-2 outline-none px-2 py-1 text-center transition-colors duration-200 bg-transparent ${inputColorClass}`}
          style={{ width: inputWidth, minWidth: '4rem' }}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          data-testid="typing-input"
        />
        <span>{textAfter}</span>
      </div>
      
      {hint && (
        <div className="mt-2 animate-in fade-in duration-300">
          <HintBadge hint={hint} />
        </div>
      )}
    </div>
  );
};
