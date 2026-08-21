"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { isSpeechSupported } from "@/lib/speech-check";

export interface UseSpeechOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
}

const emptySubscribe = () => () => {};

export function useSpeech(options: UseSpeechOptions = {}) {
  const { rate = 0.8, pitch = 1.0, lang = "en-US" } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMountedRef = useRef(true);

  // Subscribe to client browser support safely without triggering cascading setState in useEffect
  const isSupported = useSyncExternalStore(
    emptySubscribe,
    () => isSpeechSupported(),
    () => false
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (utteranceRef.current) {
        utteranceRef.current.onstart = null;
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (isMountedRef.current) {
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, customLang?: string) => {
      if (!isSpeechSupported() || typeof window === "undefined" || !window.speechSynthesis) {
        return;
      }

      // Cancel any ongoing utterance before speaking (FR-016)
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = customLang || lang;
      utterance.rate = rate; // 0.8 for kids
      utterance.pitch = pitch;

      utterance.onstart = () => {
        if (isMountedRef.current && utteranceRef.current === utterance) {
          setIsSpeaking(true);
        }
      };

      utterance.onend = () => {
        if (isMountedRef.current && utteranceRef.current === utterance) {
          setIsSpeaking(false);
        }
      };

      utterance.onerror = () => {
        if (isMountedRef.current && utteranceRef.current === utterance) {
          setIsSpeaking(false);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [lang, rate, pitch]
  );

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
  };
}
