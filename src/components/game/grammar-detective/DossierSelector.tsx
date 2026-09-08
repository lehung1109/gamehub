// src/components/game/grammar-detective/DossierSelector.tsx
'use client';

import React, { useState } from 'react';
import type { CaseFile, RankTier, ContextCategory } from '@/types/grammar-detective';
import { isTierUnlocked } from '@/hooks/useGrammarDetective';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  CheckCircle2,
  Mail,
  AlertTriangle,
  MessageSquare,
  Users,
  Search,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DossierSelectorProps {
  cases: CaseFile[];
  completedCaseIds: string[];
  userRank: RankTier;
  highestStreak?: number;
  onSelectCase: (caseId: string) => void;
  onStartEndless?: () => void;
}

const rankTierInfo: Record<
  RankTier,
  { name: string; titleVi: string; emoji: string; minSolved: number }
> = {
  intern: {
    name: 'Intern Detective',
    titleVi: 'Thám tử Tập sự',
    emoji: '🔍',
    minSolved: 0,
  },
  junior: {
    name: 'Junior Investigator',
    titleVi: 'Điều tra viên Sơ cấp',
    emoji: '🕵️',
    minSolved: 3,
  },
  senior: {
    name: 'Senior Inspector',
    titleVi: 'Thanh tra Trung cấp',
    emoji: '🎖️',
    minSolved: 6,
  },
  chief: {
    name: 'Chief Detective',
    titleVi: 'Đại thám tử Trưởng',
    emoji: '👑',
    minSolved: 9,
  },
};

const categoryIcons = {
  email: Mail,
  incident: AlertTriangle,
  chat: MessageSquare,
  social: Users,
};

export const DossierSelector: React.FC<DossierSelectorProps> = ({
  cases,
  completedCaseIds,
  userRank,
  highestStreak = 0,
  onSelectCase,
  onStartEndless,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ContextCategory | 'all'>('all');
  const [activeTier, setActiveTier] = useState<RankTier>(() => userRank);

  const filteredCases = cases.filter((c) => {
    const matchesTier = c.rankTier === activeTier;
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesTier && matchesCategory;
  });

  const solvedCount = completedCaseIds.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Detective Profile Badge Card */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-card to-muted/40 shadow-sm">
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="text-4xl p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
              {rankTierInfo[userRank].emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs uppercase tracking-wider font-bold">
                  {rankTierInfo[userRank].name}
                </Badge>
                <span className="text-xs text-muted-foreground">({rankTierInfo[userRank].titleVi})</span>
              </div>
              <h2 className="text-xl font-black text-foreground mt-0.5">
                Hồ sơ lưu trữ các vụ án
              </h2>
              <p className="text-xs text-muted-foreground">
                Đã phá giải thành công: <strong className="text-foreground">{solvedCount} / {cases.length} vụ án</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onStartEndless && (
              <Button
                type="button"
                variant="default"
                onClick={onStartEndless}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 text-xs shadow-md"
              >
                <span>🔥 Thử thách Vô tận</span>
                {highestStreak > 0 && (
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white font-bold">
                    Kỷ lục: {highestStreak}
                  </Badge>
                )}
              </Button>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border text-xs font-bold text-foreground">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>Cấp bậc: {rankTierInfo[userRank].titleVi}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rank Tier Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(Object.keys(rankTierInfo) as RankTier[]).map((tierKey) => {
          const tier = rankTierInfo[tierKey];
          const isUnlocked = isTierUnlocked(tierKey, solvedCount);
          const isCurrentActive = activeTier === tierKey;

          return (
            <button
              key={tierKey}
              type="button"
              onClick={() => setActiveTier(tierKey)}
              className={cn(
                'p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer relative overflow-hidden',
                isCurrentActive
                  ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                  : 'border-muted hover:border-primary/40 bg-card',
                !isUnlocked && 'opacity-70'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{tier.emoji}</span>
                {!isUnlocked ? (
                  <Badge variant="secondary" className="text-xs gap-1 px-1.5 py-0 text-muted-foreground">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Cần {tier.minSolved} vụ</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 text-emerald-600 dark:text-emerald-400">
                    Mở khóa
                  </Badge>
                )}
              </div>
              <div className="font-bold text-sm text-foreground">{tier.name}</div>
              <div className="text-xs text-muted-foreground">{tier.titleVi}</div>
            </button>
          );
        })}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Chủ đề:</span>
        {(['all', 'email', 'incident', 'chat', 'social'] as const).map((cat) => (
          <Button
            key={cat}
            type="button"
            variant={selectedCategory === cat ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'text-xs font-semibold h-7 px-3 rounded-full',
              selectedCategory === cat && 'bg-primary text-primary-foreground font-bold shadow-xs'
            )}
          >
            {cat === 'all' && 'Tất cả'}
            {cat === 'email' && 'Email công việc'}
            {cat === 'incident' && 'Sự cố (Incident)'}
            {cat === 'chat' && 'Tin nhắn nhóm'}
            {cat === 'social' && 'Giao tiếp xã hội'}
          </Button>
        ))}
      </div>

      {/* Case Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.length === 0 ? (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl bg-card/40 space-y-2">
            <p className="text-sm font-semibold text-foreground">Không có vụ án nào phù hợp với bộ lọc</p>
            <p className="text-xs text-muted-foreground">
              Hãy thử chọn chủ đề khác hoặc bấm nút bên dưới để xem toàn bộ vụ án
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="text-xs mt-2"
            >
              Xem tất cả vụ án
            </Button>
          </div>
        ) : (
          filteredCases.map((caseItem) => {
          const isCompleted = completedCaseIds.includes(caseItem.id);
          const isUnlocked = isTierUnlocked(caseItem.rankTier, solvedCount);
          const IconComp = categoryIcons[caseItem.category] || Mail;

          return (
            <Card
              key={caseItem.id}
              className={cn(
                'border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden',
                isUnlocked ? 'hover:shadow-md hover:border-primary/60' : 'opacity-75 bg-muted/30'
              )}
            >
              <CardHeader className="p-4 pb-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs uppercase font-bold gap-1">
                    <IconComp className="w-3 h-3 text-primary" />
                    <span>{caseItem.category}</span>
                  </Badge>

                  {isCompleted && (
                    <Badge variant="default" className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-600 text-white font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã phá án</span>
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-base font-bold text-foreground">
                  {caseItem.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {caseItem.titleVi}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                <div className="text-xs text-muted-foreground line-clamp-2 bg-muted/40 p-2 rounded">
                  &ldquo;{caseItem.documentText}&rdquo;
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t">
                  <span className="text-muted-foreground">
                    Manh mối: <strong className="text-foreground">{caseItem.errors.length} lỗi</strong>
                  </span>

                  <Button
                    type="button"
                    variant={isUnlocked ? 'default' : 'secondary'}
                    size="sm"
                    disabled={!isUnlocked}
                    onClick={() => onSelectCase(caseItem.id)}
                    className="gap-1.5 text-xs font-bold"
                  >
                    {!isUnlocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Bị khóa</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Mở lại hồ sơ' : 'Thụ lý vụ án'}</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }))}
      </div>
    </div>
  );
};
