"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

export interface SpeakButtonProps {
  text: string;
  lang?: string;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  ariaLabel?: string;
}

export function SpeakButton({
  text,
  lang = "en-US",
  disabled = false,
  size = "icon",
  className,
  ariaLabel = "Phát âm / Speak",
}: SpeakButtonProps) {
  const { speak, isSpeaking, isSupported } = useSpeech();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !text) return;
    speak(text, lang);
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      disabled={disabled || !isSupported}
      onClick={handleSpeak}
      aria-label={ariaLabel}
      className={cn(
        "rounded-full shadow-md transition-all active:scale-95 cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-200 border-2 border-emerald-200 dark:border-emerald-800",
        isSpeaking && "animate-pulse ring-4 ring-emerald-400/50 bg-emerald-100 dark:bg-emerald-900",
        size === "icon" && "w-14 h-14 text-xl",
        className
      )}
    >
      {isSupported ? (
        <Volume2 className={cn("w-7 h-7 text-emerald-700 dark:text-emerald-400 stroke-[2.5]", isSpeaking && "scale-110")} />
      ) : (
        <VolumeX className="w-6 h-6 text-muted-foreground" />
      )}
    </Button>
  );
}
