"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export interface SlotItem {
  id: string;
  label: string;
}

export interface DropSlotsProps {
  slots: (SlotItem | null)[];
  onSlotClick?: (index: number, item: SlotItem | null) => void;
  status?: "idle" | "correct" | "wrong";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  itemTypeLabel?: string;
}

interface SingleSlotProps {
  index: number;
  item: SlotItem | null;
  status: "idle" | "correct" | "wrong";
  disabled: boolean;
  itemTypeLabel: string;
  onClick?: () => void;
}

function SingleSlot({ index, item, status, disabled, itemTypeLabel, onClick }: SingleSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { index },
    disabled,
  });

  const isFilled = item !== null;
  const slotAriaLabel = isFilled
    ? `Ô ${itemTypeLabel} ${index + 1}: ${item.label}`
    : `Ô ${itemTypeLabel} ${index + 1}: trống`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={slotAriaLabel}
      className={cn(
        "relative flex items-center justify-center font-black rounded-2xl select-none transition-all duration-150 touch-none",
        "min-w-12 h-14 sm:min-w-16 sm:h-18 md:min-w-20 md:h-22 px-2 sm:px-4 text-xl sm:text-2xl md:text-3xl",
        "border-3 sm:border-4 shadow-md",
        !isFilled &&
          !isOver &&
          "bg-background/80 border-dashed border-primary/40 text-muted-foreground hover:border-primary/70",
        !isFilled &&
          isOver &&
          "bg-primary/15 border-dashed border-primary ring-4 ring-primary/30 scale-105",
        isFilled &&
          status === "idle" &&
          "bg-card text-card-foreground border-primary/60 border-b-6 sm:border-b-8 border-b-primary shadow-lg cursor-pointer hover:border-primary hover:scale-102 active:scale-98",
        isFilled &&
          status === "correct" &&
          "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100 border-emerald-500 border-b-6 sm:border-b-8 border-b-emerald-600 shadow-emerald-500/20 animate-celebrate",
        isFilled &&
          status === "wrong" &&
          "bg-rose-100 dark:bg-rose-950/80 text-rose-950 dark:text-rose-100 border-rose-500 border-b-6 sm:border-b-8 border-b-rose-600 shadow-rose-500/20 animate-shake",
        disabled && "cursor-not-allowed opacity-90"
      )}
    >
      {isFilled ? (
        <span className="transform transition-transform whitespace-nowrap">{item.label}</span>
      ) : (
        <span className="w-5 h-1 sm:w-7 sm:h-1.5 rounded-full bg-primary/30" />
      )}
    </button>
  );
}

export function DropSlots({
  slots,
  onSlotClick,
  status = "idle",
  disabled = false,
  className,
  ariaLabel = "Các ô ghép chữ",
  itemTypeLabel = "chữ cái",
}: DropSlotsProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 p-3 sm:p-5 rounded-3xl bg-primary/5 border-2 border-primary/20 min-h-20 sm:min-h-26",
        className
      )}
    >
      {slots.map((item, index) => (
        <SingleSlot
          key={`slot-${index}`}
          index={index}
          item={item}
          status={status}
          disabled={disabled}
          itemTypeLabel={itemTypeLabel}
          onClick={() => onSlotClick?.(index, item)}
        />
      ))}
    </div>
  );
}
