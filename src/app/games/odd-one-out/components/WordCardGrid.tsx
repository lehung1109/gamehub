"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SemanticWordItem } from "@/types/odd-one-out";
import { SemanticWordCard } from "./SemanticWordCard";

export interface WordCardGridProps {
  items: SemanticWordItem[];
  selectedId: string | null;
  eliminatedIds: string[];
  isAnswerChecked: boolean;
  oddItemId?: string;
  onSelect: (id: string) => void;
  onSpeak?: (word: string) => void;
  disabled?: boolean;
  className?: string;
}

export function WordCardGrid({
  items,
  selectedId,
  eliminatedIds,
  isAnswerChecked,
  oddItemId,
  onSelect,
  onSpeak,
  disabled = false,
  className,
}: WordCardGridProps) {
  return (
    <div
      data-testid="word-card-grid"
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl mx-auto",
        className
      )}
    >
      {items.map((item, index) => {
        const isSelected = selectedId === item.id;
        const isEliminated = eliminatedIds.includes(item.id);
        const isOdd = oddItemId !== undefined ? item.id === oddItemId : item.isOdd;

        return (
          <SemanticWordCard
            key={item.id}
            item={item}
            index={index}
            isSelected={isSelected}
            isEliminated={isEliminated}
            isAnswerChecked={isAnswerChecked}
            isOddItem={isOdd}
            onSelect={onSelect}
            onSpeak={onSpeak}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
