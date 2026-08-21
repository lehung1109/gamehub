"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export interface DraggableItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface LetterBankProps {
  items: DraggableItem[];
  placedIds?: string[];
  onItemClick?: (item: DraggableItem) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

interface DraggableTileProps {
  item: DraggableItem;
  isPlaced: boolean;
  disabled: boolean;
  onClick?: () => void;
}

function DraggableTile({ item, isPlaced, disabled, onClick }: DraggableTileProps) {
  const isInactive = isPlaced || disabled;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: item,
    disabled: isInactive,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={() => {
        if (!isInactive) {
          onClick?.();
        }
      }}
      aria-label={`Chữ cái ${item.label}`}
      aria-disabled={isInactive ? "true" : "false"}
      disabled={isInactive}
      className={cn(
        "relative flex items-center justify-center font-black rounded-2xl select-none transition-all duration-150 touch-none",
        "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-xl sm:text-2xl md:text-3xl",
        "border-2 sm:border-3 border-b-4 sm:border-b-6 active:border-b-2 active:translate-y-1",
        isInactive
          ? "opacity-20 bg-muted/40 text-muted-foreground border-muted cursor-not-allowed pointer-events-none"
          : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-400 border-b-amber-500 shadow-md cursor-pointer active:cursor-grabbing dark:bg-amber-950/70 dark:text-amber-100 dark:border-amber-700 dark:border-b-amber-800",
        isDragging && "opacity-30 scale-95"
      )}
    >
      <span>{item.label}</span>
    </button>
  );
}

export function LetterBank({
  items,
  placedIds = [],
  onItemClick,
  disabled = false,
  className,
  ariaLabel = "Ngân hàng chữ cái",
}: LetterBankProps) {
  const placedSet = React.useMemo(() => new Set(placedIds), [placedIds]);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-3xl bg-muted/30 border-2 border-dashed border-muted-foreground/30 min-h-18 sm:min-h-22",
        className
      )}
    >
      {items.map((item) => {
        const isPlaced = placedSet.has(item.id);
        return (
          <DraggableTile
            key={item.id}
            item={item}
            isPlaced={isPlaced}
            disabled={disabled || !!item.disabled}
            onClick={() => onItemClick?.(item)}
          />
        );
      })}
    </div>
  );
}
