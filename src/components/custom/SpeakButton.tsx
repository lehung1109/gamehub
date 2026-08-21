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
        "rounded-full shadow-md transition-all active:scale-95 cursor-pointer",
        isSpeaking && "animate-pulse ring-4 ring-primary/40 bg-primary/20",
        size === "icon" && "w-12 h-12 text-xl",
        className
      )}
    >
      {isSupported ? (
        <Volume2 className={cn("w-6 h-6 text-primary stroke-[2.5]", isSpeaking && "text-primary scale-110")} />
      ) : (
        <VolumeX className="w-6 h-6 text-muted-foreground" />
      )}
    </Button>
  );
}
