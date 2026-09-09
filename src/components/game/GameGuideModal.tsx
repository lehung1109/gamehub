"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GameInstruction,
  getGameInstruction,
} from "@/data/game-instructions";
import {
  HelpCircle,
  Lightbulb,
  MousePointer,
  Keyboard,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Target,
  ListOrdered,
} from "lucide-react";

export interface GameGuideModalProps {
  instruction?: GameInstruction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameGuideModal({
  instruction,
  open,
  onOpenChange,
}: GameGuideModalProps) {
  if (!instruction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[88vh] flex flex-col bg-card border-2 border-emerald-500/20 dark:border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden"
        showCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="gap-2 text-left pb-2 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-3xl shadow-xs select-none shrink-0"
              aria-hidden="true"
            >
              {instruction.emoji}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {instruction.titleVi}
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200 border border-sky-200 dark:border-sky-800"
                >
                  {instruction.titleEn}
                </Badge>
              </div>
              <DialogDescription className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2 mt-0.5">
                {instruction.summary}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body Content - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1 text-foreground">
          {/* Goal Section */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs shrink-0 mt-0.5">
              <Target className="size-4" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                Mục tiêu trò chơi
              </h3>
              <p className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
                {instruction.goal}
              </p>
            </div>
          </div>

          {/* Steps Section */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <ListOrdered className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cách chơi từng bước</span>
            </h3>
            <div className="space-y-2">
              {instruction.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs sm:text-sm leading-relaxed"
                >
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-black text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="font-medium text-foreground/90">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <MousePointer className="size-4 text-sky-600 dark:text-sky-400" />
              <span>Thao tác điều khiển</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              {instruction.controls.mouse && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/40">
                  <MousePointer className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-sky-900 dark:text-sky-200">
                      Chuột / Cảm ứng
                    </strong>
                    <span className="text-muted-foreground">{instruction.controls.mouse}</span>
                  </div>
                </div>
              )}

              {instruction.controls.keyboard && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40">
                  <Keyboard className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-indigo-900 dark:text-indigo-200">
                      Bàn phím
                    </strong>
                    <span className="text-muted-foreground">{instruction.controls.keyboard}</span>
                  </div>
                </div>
              )}

              {instruction.controls.touch && !instruction.controls.mouse && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40">
                  <Smartphone className="size-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-purple-900 dark:text-purple-200">
                      Cảm ứng di động
                    </strong>
                    <span className="text-muted-foreground">{instruction.controls.touch}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips Section */}
          {instruction.tips && instruction.tips.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
              <h3 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Lightbulb className="size-4 text-amber-600 dark:text-amber-400" />
                <span>Mẹo ghi điểm cao</span>
              </h3>
              <ul className="space-y-1.5 pl-1">
                {instruction.tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm font-medium text-amber-900/90 dark:text-amber-200/90"
                  >
                    <CheckCircle2 className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="pt-3 border-t border-border/50 sm:justify-end">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl gap-2 h-11 px-6 shadow-sm cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>Đã hiểu, chơi thôi!</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GameGuideHeaderButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const instruction = getGameInstruction(pathname);
  if (!instruction) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Hướng dẫn chơi ${instruction.titleVi}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <HelpCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span>Hướng dẫn</span>
      </button>

      <GameGuideModal
        instruction={instruction}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

export interface GameGuideCardButtonProps {
  gameId: string;
  className?: string;
}

export function GameGuideCardButton({
  gameId,
  className = "",
}: GameGuideCardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const instruction = getGameInstruction(gameId);

  if (!instruction) return null;

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick(e);
          }
        }}
        aria-label={`Hướng dẫn trò chơi ${instruction.titleVi}`}
        title={`Xem hướng dẫn ${instruction.titleVi}`}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      >
        <HelpCircle className="size-3.5" />
        <span>Hướng dẫn</span>
      </span>

      <GameGuideModal
        instruction={instruction}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
