// src/components/game/grammar-detective/DetectiveDesk.tsx
'use client';

import React from 'react';
import type { CaseFile, TextToken } from '@/types/grammar-detective';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Volume2, Mail, AlertTriangle, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetectiveDeskProps {
  caseFile: CaseFile;
  tokens: TextToken[];
  highlighterActive: boolean;
  onTokenTap: (tokenId: string) => void;
  onSpeak: (text: string) => void;
}

const categoryIcons = {
  email: Mail,
  incident: AlertTriangle,
  chat: MessageSquare,
  social: Users,
};

const categoryBadgeLabels = {
  email: 'Email công sở',
  incident: 'Báo cáo sự cố (Incident)',
  chat: 'Tin nhắn nhóm (Team Chat)',
  social: 'Giao tiếp cộng đồng',
};

export const DetectiveDesk: React.FC<DetectiveDeskProps> = ({
  caseFile,
  tokens,
  highlighterActive,
  onTokenTap,
  onSpeak,
}) => {
  const IconComponent = categoryIcons[caseFile.category] || Mail;

  return (
    <Card className="relative w-full max-w-4xl mx-auto overflow-hidden border-2 shadow-xl bg-card text-card-foreground">
      {/* Desk Header Bar */}
      <div className="bg-muted/80 backdrop-blur border-b px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider">
                {categoryBadgeLabels[caseFile.category]}
              </Badge>
              <Badge variant="secondary" className="text-xs uppercase font-semibold">
                Tier: {caseFile.rankTier}
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground mt-0.5">{caseFile.title}</h2>
            <p className="text-xs text-muted-foreground">{caseFile.titleVi}</p>
          </div>
        </div>

        {/* Read aloud action */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSpeak(caseFile.documentText)}
          className="gap-1.5 text-xs font-semibold"
          aria-label="Nghe đọc toàn bộ văn bản"
        >
          <Volume2 className="w-4 h-4 text-primary" />
          <span>Nghe đọc văn bản</span>
        </Button>
      </div>

      {/* Metadata headers */}
      <div className="bg-muted/30 border-b px-5 py-2.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground">From:</span> {caseFile.sender}
        </div>
        <div>
          <span className="font-semibold text-foreground">To:</span> {caseFile.recipient}
        </div>
        <div className="sm:col-span-2">
          <span className="font-semibold text-foreground">Subject:</span> {caseFile.subject}
        </div>
      </div>

      {/* Document Investigation Surface */}
      <div className="p-6 sm:p-8 min-h-[160px] leading-relaxed text-base sm:text-lg select-none font-sans">
        <div className="inline">
          {tokens.map((token) => {
            if (!token.isWord) {
              return (
                <span key={token.id} className="whitespace-pre-wrap select-none text-foreground/80">
                  {token.text}
                </span>
              );
            }

            return (
              <button
                key={token.id}
                type="button"
                onClick={() => onTokenTap(token.id)}
                aria-label={token.text}
                className={cn(
                  'inline-block px-1 py-0.5 mx-0.5 rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary select-none cursor-pointer',
                  token.isCorrected &&
                    'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold underline decoration-emerald-500 decoration-2 shadow-xs',
                  !token.isCorrected &&
                    highlighterActive &&
                    'hover:bg-yellow-200/90 dark:hover:bg-yellow-800/60 active:scale-95',
                  !token.isCorrected && !highlighterActive && 'hover:bg-accent/40 text-foreground'
                )}
              >
                {token.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desk Bottom Hint Bar */}
      <div className="bg-muted/40 border-t px-5 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          🔍 Manh mối cần tìm: <strong className="text-foreground">{caseFile.errors.length} lỗi</strong>
        </span>
        <span className="italic">
          {highlighterActive
            ? '⚡ Bút dạ quang đang BẬT: Bấm vào từ nghi vấn để quét lỗi'
            : 'Đang ở chế độ đọc: Bật bút dạ quang để đánh dấu'}
        </span>
      </div>
    </Card>
  );
};
