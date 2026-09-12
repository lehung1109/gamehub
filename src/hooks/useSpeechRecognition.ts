'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechRecognitionResultState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultItemLike {
  [index: number]: SpeechRecognitionAlternativeLike;
  isFinal?: boolean;
  length: number;
}

export interface SpeechRecognitionResultListLike {
  [index: number]: SpeechRecognitionResultItemLike;
  length: number;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
}

export interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): SpeechRecognitionResultState {
  const { lang = 'en-US', continuous = false, interimResults = true } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<'not-allowed' | 'no-speech' | 'network' | 'unsupported' | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isMountedRef = useRef(true);

  const getSpeechRecognitionAPI = useCallback((): SpeechRecognitionConstructor | null => {
    if (typeof window === 'undefined') return null;
    const win = window as unknown as WindowWithSpeechRecognition;
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
  }, []);

  const isSupported = Boolean(getSpeechRecognitionAPI());

  const cleanupRecognition = useCallback((instance: SpeechRecognitionInstance | null) => {
    if (!instance) return;
    try {
      instance.onstart = null;
      instance.onresult = null;
      instance.onerror = null;
      instance.onend = null;
      instance.abort();
    } catch {
      // ignore cleanup abort error
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        cleanupRecognition(recognitionRef.current);
        recognitionRef.current = null;
      }
    };
  }, [cleanupRecognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) {
      setError('unsupported');
      return;
    }

    if (recognitionRef.current) {
      cleanupRecognition(recognitionRef.current);
      recognitionRef.current = null;
    }

    resetTranscript();

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      if (isMountedRef.current) {
        setIsListening(true);
        setError(null);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      if (!isMountedRef.current) return;

      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const isFinal = item.isFinal ?? true;
        if (isFinal || !interimResults) {
          finalStr += item[0].transcript;
        } else {
          interimStr += item[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript((prev) => (prev ? `${prev} ${finalStr}` : finalStr));
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (!isMountedRef.current) return;
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('not-allowed');
      } else if (event.error === 'no-speech') {
        setError('no-speech');
      } else {
        setError('network');
      }
    };

    recognition.onend = () => {
      if (isMountedRef.current) {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      // already started or busy
    }
  }, [getSpeechRecognitionAPI, cleanupRecognition, lang, continuous, interimResults, resetTranscript]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
