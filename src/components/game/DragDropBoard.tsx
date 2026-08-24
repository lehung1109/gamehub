"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { LetterBank, DraggableItem } from "./LetterBank";
import { DropSlots, SlotItem } from "./DropSlots";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export { type DraggableItem, type SlotItem };

export interface DragDropBoardProps {
  targetItems: string[];
  bankItems: DraggableItem[];
  onComplete?: (isCorrect: boolean, formedString: string) => void;
  onStateChange?: (slots: (SlotItem | null)[]) => void;
  onItemPlaced?: (item: DraggableItem | SlotItem) => void;
  disabled?: boolean;
  showCheckButton?: boolean;
  onReset?: () => void;
  className?: string;
  itemTypeLabel?: string;
  joinSeparator?: string;
}

export function DragDropBoard({
  targetItems,
  bankItems,
  onComplete,
  onStateChange,
  onItemPlaced,
  disabled = false,
  showCheckButton = false,
  onReset,
  className,
  itemTypeLabel = "chữ cái",
  joinSeparator = "",
}: DragDropBoardProps) {
  const [slots, setSlots] = useState<(SlotItem | null)[]>(() =>
    new Array(targetItems.length).fill(null)
  );
  const [activeItem, setActiveItem] = useState<DraggableItem | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const [prevTargetItems, setPrevTargetItems] = useState(targetItems);
  if (targetItems !== prevTargetItems) {
    setPrevTargetItems(targetItems);
    setSlots(new Array(targetItems.length).fill(null));
    setStatus("idle");
    setActiveItem(null);
  }

  // Pointer sensor with distance activation constraint
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  // Placed item IDs in slots
  const placedIds = useMemo(() => {
    return slots.filter((s): s is SlotItem => s !== null).map((s) => s.id);
  }, [slots]);

  // Check correctness helper
  const checkCompletion = useCallback(
    (currentSlots: (SlotItem | null)[]) => {
      const isAllFilled = currentSlots.every((s) => s !== null);
      if (!isAllFilled) {
        setStatus("idle");
        return;
      }

      const formed = currentSlots.map((s) => s?.label || "").join(joinSeparator);
      const target = targetItems.join(joinSeparator);
      const isCorrect = formed.trim().toUpperCase() === target.trim().toUpperCase();

      setStatus(isCorrect ? "correct" : "wrong");
      onComplete?.(isCorrect, formed);
    },
    [targetItems, joinSeparator, onComplete]
  );

  const updateSlots = useCallback(
    (newSlots: (SlotItem | null)[]) => {
      setSlots(newSlots);
      onStateChange?.(newSlots);
      if (!showCheckButton) {
        checkCompletion(newSlots);
      }
    },
    [onStateChange, showCheckButton, checkCompletion]
  );

  // Handle Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const foundInBank = bankItems.find((item) => item.id === active.id);
    if (foundInBank) {
      setActiveItem(foundInBank);
      return;
    }
    const foundInSlot = slots.find((s) => s?.id === active.id);
    if (foundInSlot) {
      setActiveItem(foundInSlot);
    }
  };

  // Handle Drag End
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (disabled) return;

    const activeId = String(active.id);
    const activeFromBank = bankItems.find((item) => item.id === activeId);
    const slotOriginIndex = slots.findIndex((s) => s?.id === activeId);

    // If dropped onto a slot
    if (over && String(over.id).startsWith("slot-")) {
      const targetSlotIndex = Number(String(over.id).replace("slot-", ""));
      if (
        isNaN(targetSlotIndex) ||
        targetSlotIndex < 0 ||
        targetSlotIndex >= slots.length
      ) {
        return;
      }

      const nextSlots = [...slots];

      if (slotOriginIndex !== -1) {
        // Dragging from one slot to another slot: Swap
        const temp = nextSlots[targetSlotIndex];
        nextSlots[targetSlotIndex] = nextSlots[slotOriginIndex];
        nextSlots[slotOriginIndex] = temp;
        if (nextSlots[targetSlotIndex]) {
          onItemPlaced?.(nextSlots[targetSlotIndex]);
        }
      } else if (activeFromBank) {
        // Dragging from bank to a slot
        const placedItem = {
          id: activeFromBank.id,
          label: activeFromBank.label,
        };
        nextSlots[targetSlotIndex] = placedItem;
        onItemPlaced?.(placedItem);
      }

      updateSlots(nextSlots);
      return;
    }

    // If dragged from a slot and dropped outside any slot, remove from slot
    if (slotOriginIndex !== -1 && (!over || !String(over.id).startsWith("slot-"))) {
      const nextSlots = [...slots];
      nextSlots[slotOriginIndex] = null;
      updateSlots(nextSlots);
    }
  };

  // Tap to place from bank
  const handleBankItemClick = (item: DraggableItem) => {
    if (disabled) return;
    const emptyIndex = slots.findIndex((s) => s === null);
    if (emptyIndex === -1) return;

    const nextSlots = [...slots];
    const placedItem = { id: item.id, label: item.label };
    nextSlots[emptyIndex] = placedItem;
    onItemPlaced?.(placedItem);
    updateSlots(nextSlots);
  };

  // Tap to remove from slot
  const handleSlotClick = (index: number) => {
    if (disabled) return;
    if (slots[index] === null) return;

    const nextSlots = [...slots];
    nextSlots[index] = null;
    updateSlots(nextSlots);
  };

  // Reset / Clear board
  const handleReset = () => {
    const emptySlots = new Array(targetItems.length).fill(null);
    setSlots(emptySlots);
    setStatus("idle");
    onReset?.();
    onStateChange?.(emptySlots);
  };

  // Manual check button handler (for sentences or when showCheckButton is true)
  const handleManualCheck = () => {
    checkCompletion(slots);
  };

  const hasAnyPlaced = placedIds.length > 0;
  const isAllFilled = slots.every((s) => s !== null);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex flex-col items-center gap-6 w-full max-w-2xl xl:max-w-4xl mx-auto", className)}>
        {/* Drop Slots Area */}
        <div className="w-full flex flex-col items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Ghép {itemTypeLabel} vào đây:
          </span>
          <DropSlots
            slots={slots}
            onSlotClick={handleSlotClick}
            status={status}
            disabled={disabled}
            itemTypeLabel={itemTypeLabel}
            className="w-full justify-center"
          />
        </div>

        {/* Bank Area */}
        <div className="w-full flex flex-col items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Chạm hoặc kéo {itemTypeLabel}:
          </span>
          <LetterBank
            items={bankItems}
            placedIds={placedIds}
            onItemClick={handleBankItemClick}
            disabled={disabled}
            itemTypeLabel={itemTypeLabel}
            className="w-full justify-center"
          />
        </div>

        {/* Control Buttons (Clear / Check) */}
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled || !hasAnyPlaced}
            aria-label="Xóa làm lại"
            className="rounded-full px-4 font-bold text-xs sm:text-sm cursor-pointer border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa làm lại</span>
          </Button>

          {showCheckButton && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleManualCheck}
              disabled={disabled || !isAllFilled}
              className="rounded-full px-5 font-bold text-xs sm:text-sm cursor-pointer bg-primary text-primary-foreground shadow-md hover:bg-primary/90 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kiểm tra</span>
            </Button>
          )}
        </div>

        {/* Drag Overlay for smooth kid-friendly floating tile without return animation */}
        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <div className="flex items-center justify-center font-black rounded-2xl select-none min-w-14 min-h-14 px-4 py-2 text-xl sm:text-2xl md:text-3xl bg-amber-200 text-amber-950 border-3 border-b-6 border-amber-500 shadow-2xl scale-110 rotate-3 whitespace-nowrap">
              {activeItem.label}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
