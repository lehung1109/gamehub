'use client';

import React, { useState, useMemo, Suspense } from 'react';
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
import { useGameConfig } from '@/hooks/useGameConfig';
import type { PronunciationSettings } from '@/types/config';
import { PreviewBanner } from '@/components/game/PreviewBanner';
import { ConfigBanner } from '@/components/game/ConfigBanner';

const DATA_MAP: Record<string, PronunciationItem[]> = {
  'minimal-pairs': minimalPairs as PronunciationItem[],
  'workplace-words': workplaceWords as PronunciationItem[],
  'standup-phrases': standupPhrases as PronunciationItem[],
};

function PronunciationPageContent() {
  const { settings, configName, isPreview, configId } = useGameConfig<PronunciationSettings>('pronunciation');
  const configTopics = settings?.topics;
  const wordLimit = settings?.wordLimit;

  // Filter topics if specified in teacher config
  const allowedTopics = useMemo(() => {
    if (configTopics && configTopics.length > 0) {
      const set = new Set(configTopics);
      const filtered = topics.filter((t) =>
        set.has(t.id as 'minimal-pairs' | 'workplace-words' | 'standup-phrases')
      );
      return filtered.length > 0 ? filtered : topics;
    }
    return topics;
  }, [configTopics]);

  const [selectedTopic, setSelectedTopic] = useState(() => allowedTopics[0]?.id || 'minimal-pairs');

  // Fallback to first allowed topic if current selectedTopic is not in allowed list
  const activeTopic = allowedTopics.some((t) => t.id === selectedTopic)
    ? selectedTopic
    : allowedTopics[0]?.id || 'minimal-pairs';

  const rawItems = DATA_MAP[activeTopic] || (minimalPairs as PronunciationItem[]);
  const items = useMemo(() => {
    if (wordLimit && wordLimit > 0) {
      return rawItems.slice(0, wordLimit);
    }
    return rawItems;
  }, [rawItems, wordLimit]);

  return (
    <Container className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), 'gap-2')}>
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {isPreview ? (
            <PreviewBanner />
          ) : (
            configName && <ConfigBanner configName={configName} />
          )}
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Game #20 Mới
          </div>
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
        {allowedTopics.map((t) => (
          <Button
            key={t.id}
            variant={activeTopic === t.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTopic(t.id)}
            className="rounded-full text-xs"
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.nameVi}
          </Button>
        ))}
      </div>

      <PronunciationArena
        key={`${activeTopic}-${configId || ''}-${items.length}`}
        items={items}
        topicId={activeTopic}
        passThreshold={settings?.passThreshold ?? 70}
        configId={configId || undefined}
      />
    </Container>
  );
}

export default function PronunciationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PronunciationPageContent />
    </Suspense>
  );
}
