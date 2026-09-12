'use client';

import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicrophoneRecorderProps {
  isListening: boolean;
  interimTranscript: string;
  isSupported: boolean;
  error: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | null;
  onToggleListening: () => void;
}

export function MicrophoneRecorder({
  isListening,
  interimTranscript,
  isSupported,
  error,
  onToggleListening,
}: MicrophoneRecorderProps) {
  if (!isSupported) {
    return (
      <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome, Edge hoặc Safari.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-2">
      <div className="relative flex items-center justify-center">
        {isListening && (
          <span className="absolute animate-ping h-20 w-20 rounded-full bg-red-400 opacity-50" />
        )}
        <Button
          type="button"
          data-testid="mic-toggle-button"
          variant={isListening ? 'destructive' : 'default'}
          size="lg"
          onClick={onToggleListening}
          className={`h-16 w-16 rounded-full shadow-md transition-all duration-200 ${
            isListening ? 'scale-105' : 'hover:scale-105'
          }`}
          aria-label={isListening ? 'Dừng thu âm' : 'Bắt đầu phát âm'}
        >
          {isListening ? (
            <MicOff className="size-8 h-8 w-8 text-white" />
          ) : (
            <Mic className="size-8 h-8 w-8 text-white" />
          )}
        </Button>
      </div>

      <div className="text-center min-h-[44px]">
        {isListening ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-red-600 animate-pulse">
              Đang nghe... hãy nói to và rõ ràng
            </p>
            {interimTranscript && (
              <p className="text-sm text-muted-foreground italic font-mono">
                &ldquo;<span>{interimTranscript}</span>&rdquo;
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-medium">
            Nhấn biểu tượng Microphone để bắt đầu đọc
          </p>
        )}
      </div>

      {error === 'not-allowed' && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Vui lòng cấp quyền truy cập Microphone trên trình duyệt để luyện nói.</span>
        </div>
      )}
    </div>
  );
}
