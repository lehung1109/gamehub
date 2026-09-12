'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';
import topics from '@/data/pronunciation/index.json';
import minimalPairs from '@/data/pronunciation/minimal-pairs.json';
import workplaceWords from '@/data/pronunciation/workplace-words.json';
import standupPhrases from '@/data/pronunciation/standup-phrases.json';
import { PronunciationItem } from '@/types/pronunciation';
import { PronunciationArena } from '@/components/game/pronunciation/PronunciationArena';

const DATA_MAP: Record<string, PronunciationItem[]> = {
  'minimal-pairs': minimalPairs as PronunciationItem[],
  'workplace-words': workplaceWords as PronunciationItem[],
  'standup-phrases': standupPhrases as PronunciationItem[],
};

export default function PronunciationPage() {
  const [selectedTopic, setSelectedTopic] = useState('minimal-pairs');
  const items = DATA_MAP[selectedTopic] || (minimalPairs as PronunciationItem[]);

  return (
    <Container className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), 'gap-2')}>
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Game #20 Mới
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          🎙️ Phòng Luyện Phát Âm
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Luyện nói tiếng Anh chuẩn xác qua microphone với phản hồi tức thì
        </p>
      </div>

      {/* Topic Switcher */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
        {topics.map((t) => (
          <Button
            key={t.id}
            variant={selectedTopic === t.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTopic(t.id)}
            className="rounded-full text-xs"
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.nameVi}
          </Button>
        ))}
      </div>

      <PronunciationArena key={selectedTopic} items={items} topicId={selectedTopic} />
    </Container>
  );
}
