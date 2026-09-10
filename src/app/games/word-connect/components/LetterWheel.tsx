"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface LetterWheelProps {
  letters: string[];
  selectedLetters: number[];
  onSelectLetter: (index: number) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isShaking?: boolean;
  disabled?: boolean;
  className?: string;
}

const WHEEL_SIZE = 260;
const CENTER_X = WHEEL_SIZE / 2;
const CENTER_Y = WHEEL_SIZE / 2;
const RADIUS = 90;

export function LetterWheel({
  letters,
  selectedLetters,
  onSelectLetter,
  onSubmit,
  onCancel,
  isShaking = false,
  disabled = false,
  className,
}: LetterWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const justFinishedDragRef = useRef<boolean>(false);
  const justProcessedPointerDownRef = useRef<number | null>(null);
  const [currentPointer, setCurrentPointer] = useState<{ x: number; y: number } | null>(null);

  // Deterministic circular layout coordinates for letter buttons
  const letterCenters = useMemo(() => {
    const count = letters.length;
    if (count === 0) return [];
    return letters.map((_, i) => {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      return {
        x: Math.round(CENTER_X + RADIUS * Math.cos(angle)),
        y: Math.round(CENTER_Y + RADIUS * Math.sin(angle)),
      };
    });
  }, [letters]);

  const getLetterIndexFromEvent = useCallback(
    (e: React.PointerEvent): number | null => {
      // 1. Check direct target element
      const target = e.target as HTMLElement | null;
      const targetBtn = target?.closest?.("[data-letter-index]");
      if (targetBtn) {
        const rawIdx = targetBtn.getAttribute("data-letter-index");
        if (rawIdx !== null) {
          const idx = Number(rawIdx);
          if (!isNaN(idx) && idx >= 0 && idx < letters.length) {
            return idx;
          }
        }
      }

      // 2. Check elementFromPoint (supported in modern browsers when pointer capture is active)
      if (typeof document !== "undefined" && typeof document.elementFromPoint === "function") {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const btn = el?.closest?.("[data-letter-index]");
        if (btn) {
          const rawIdx = btn.getAttribute("data-letter-index");
          if (rawIdx !== null) {
            const idx = Number(rawIdx);
            if (!isNaN(idx) && idx >= 0 && idx < letters.length) {
              return idx;
            }
          }
        }
      }

      // 3. Fallback: Check geometric distance from letter nodes
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const pointerX = e.clientX - rect.left;
        const pointerY = e.clientY - rect.top;

        for (let i = 0; i < letterCenters.length; i++) {
          const center = letterCenters[i];
          const dist = Math.hypot(pointerX - center.x, pointerY - center.y);
          if (dist <= 30) {
            return i;
          }
        }
      }

      return null;
    },
    [letterCenters, letters.length]
  );

  const updatePointerPos = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCurrentPointer({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const idx = getLetterIndexFromEvent(e);
    if (idx !== null) {
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      justProcessedPointerDownRef.current = idx;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback in environments without full pointer capture support
      }
      onSelectLetter(idx);
      updatePointerPos(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || disabled) return;
    hasDraggedRef.current = true;
    updatePointerPos(e);

    const idx = getLetterIndexFromEvent(e);
    if (idx !== null) {
      onSelectLetter(idx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
    setCurrentPointer(null);

    if (hasDraggedRef.current) {
      justFinishedDragRef.current = true;
      setTimeout(() => {
        justFinishedDragRef.current = false;
        justProcessedPointerDownRef.current = null;
      }, 80);
      onSubmit();
    } else {
      setTimeout(() => {
        justProcessedPointerDownRef.current = null;
      }, 80);
      onCancel?.();
    }
  };

  const handleLetterClick = (index: number) => {
    if (disabled || justFinishedDragRef.current) return;
    if (justProcessedPointerDownRef.current === index) {
      // Already selected on pointerdown during the same tap gesture
      return;
    }
    onSelectLetter(index);
  };

  return (
    <div
      ref={containerRef}
      data-testid="letter-wheel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        "relative w-[260px] h-[260px] rounded-full select-none touch-none",
        "bg-gradient-to-b from-slate-100 to-slate-200/90 dark:from-slate-800 dark:to-slate-900",
        "border-4 border-slate-300 dark:border-slate-700 shadow-xl flex items-center justify-center",
        isShaking && "animate-shake",
        className
      )}
    >
      {/* SVG Connectors Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
      >
        {selectedLetters.length >= 2 && (
          <polyline
            points={selectedLetters
              .map((idx) => {
                const pt = letterCenters[idx];
                return pt ? `${pt.x},${pt.y}` : "";
              })
              .filter(Boolean)
              .join(" ")}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-md"
          />
        )}
        {currentPointer &&
          selectedLetters.length > 0 &&
          letterCenters[selectedLetters[selectedLetters.length - 1]] && (
            <line
              x1={letterCenters[selectedLetters[selectedLetters.length - 1]].x}
              y1={letterCenters[selectedLetters[selectedLetters.length - 1]].y}
              x2={currentPointer.x}
              y2={currentPointer.y}
              stroke="#f59e0b"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="4 4"
              className="opacity-75"
            />
          )}
      </svg>

      {/* Circular Letter Buttons */}
      {letters.map((letter, index) => {
        const center = letterCenters[index] || { x: CENTER_X, y: CENTER_Y };
        const isSelected = selectedLetters.includes(index);

        return (
          <button
            key={index}
            type="button"
            data-testid={`letter-node-${index}`}
            data-letter-index={index}
            aria-label={`Chữ cái ${letter}`}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => handleLetterClick(index)}
            style={{
              left: `${center.x}px`,
              top: `${center.y}px`,
            }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 z-20",
              "w-14 h-14 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center",
              "font-extrabold text-2xl uppercase transition-all duration-150 cursor-pointer select-none",
              "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2",
              isSelected
                ? "bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-lg ring-4 ring-amber-300/60 scale-110"
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:scale-105 active:scale-95",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
