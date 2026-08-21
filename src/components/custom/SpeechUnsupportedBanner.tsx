"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SpeechUnsupportedBannerProps {
  show: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function SpeechUnsupportedBanner({
  show,
  onDismiss,
  className,
}: SpeechUnsupportedBannerProps) {
  if (!show) return null;

  return (
    <div
      role="alert"
      className={cn(
        "w-full bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-100 p-4 rounded-2xl shadow-md flex items-start gap-3 justify-between my-4 transition-all animate-in fade-in-0 duration-200",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm sm:text-base">
          <p className="font-bold">
            Trình duyệt chưa hỗ trợ phát âm tiếng Anh!
          </p>
          <p className="text-amber-800/90 dark:text-amber-200/90 text-sm">
            Để nghe được giọng đọc chuẩn, bạn hãy mở trang này bằng trình duyệt{" "}
            <strong className="font-semibold underline">Chrome, Edge, hoặc Safari</strong> nhé.
          </p>
        </div>
      </div>

      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Đã hiểu / Đóng"
          className="rounded-full hover:bg-amber-200/50 text-amber-900 dark:text-amber-100 shrink-0 cursor-pointer"
        >
          <span className="hidden sm:inline mr-1 text-xs font-bold">Đã hiểu</span>
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
