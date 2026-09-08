// src/app/games/grammar-detective/page.tsx
'use client';

import React from 'react';
import casesData from '@/data/grammar-detective.json';
import type { CaseFile } from '@/types/grammar-detective';
import { useGrammarDetective } from '@/hooks/useGrammarDetective';
import { useSpeech } from '@/hooks/useSpeech';
import { useGameTracking } from '@/hooks/use-game-tracking';
import { DetectiveDesk } from '@/components/game/grammar-detective/DetectiveDesk';
import { DeductionCard } from '@/components/game/grammar-detective/DeductionCard';
import { CaseSolvedModal } from '@/components/game/grammar-detective/CaseSolvedModal';
import { CaseColdModal } from '@/components/game/grammar-detective/CaseColdModal';
import { DossierSelector } from '@/components/game/grammar-detective/DossierSelector';
import { EndlessAuditHeader } from '@/components/game/grammar-detective/EndlessAuditHeader';
import { BackButton } from '@/components/custom/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Highlighter, Heart, Search, RotateCcw, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const allCases = casesData as unknown as CaseFile[];

export default function GrammarDetectivePage() {
  const { speak } = useSpeech();
  const { submitSession } = useGameTracking({ gameType: 'grammar-detective' });
  const trackedCaseRef = React.useRef<string | null>(null);

  const {
    mode,
    currentCase,
    tokens,
    credibility,
    maxCredibility,
    solvedErrorIds,
    activeError,
    status,
    highlighterActive,
    mistakes,
    elapsedSeconds,
    starsEarned,
    userRank,
    completedCaseIds,
    streak,
    highestStreak,
    selectCase,
    startEndless,
    nextEndlessRound,
    toggleHighlighter,
    tapToken,
    submitDeduction,
    closeDeduction,
    retryCase,
    returnToDossier,
    lastFeedback,
  } = useGrammarDetective(allCases);

  // Submit session tracking when a case is solved
  React.useEffect(() => {
    if (
      status === 'solved' &&
      currentCase &&
      trackedCaseRef.current !== `${currentCase.id}-${elapsedSeconds}`
    ) {
      trackedCaseRef.current = `${currentCase.id}-${elapsedSeconds}`;
      submitSession({
        score: starsEarned,
        totalQuestions: currentCase.errors.length,
        details: [
          {
            prompt: `Phá án "${currentCase.title}" (${currentCase.titleVi}) - Đạt ${starsEarned} sao, còn ${credibility}/3 uy tín, thời gian ${elapsedSeconds}s`,
            isCorrect: true,
            timeTakenMs: elapsedSeconds * 1000,
            attempts: mistakes,
          },
        ],
      });
    }
  }, [status, currentCase, starsEarned, credibility, elapsedSeconds, mistakes, submitSession]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <BackButton href="/games" label="Trang chủ game" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span>🕵️ Grammar Detective</span>
              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider">
                Thám tử sửa lỗi
              </Badge>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Soi và sửa các lỗi ngữ pháp, thì và văn phong trong hồ sơ công sở thực tế
            </p>
          </div>
        </div>

        {/* Credibility and Solved Progress */}
        {status !== 'selecting' && currentCase && (
          <div className="flex items-center gap-3 bg-muted/60 p-2.5 rounded-xl border">
            {/* Credibility Lives */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-muted-foreground mr-1">Uy tín:</span>
              {Array.from({ length: maxCredibility }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    'w-5 h-5 transition-all duration-200',
                    i < credibility
                      ? 'text-rose-500 fill-rose-500 scale-100'
                      : 'text-muted-foreground/30 scale-90'
                  )}
                />
              ))}
            </div>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Solved Count */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Search className="w-4 h-4 text-primary" />
              <span>
                Phá án: {solvedErrorIds.length}/{currentCase.errors.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dossier Selection Screen */}
      {status === 'selecting' && (
        <DossierSelector
          cases={allCases}
          completedCaseIds={completedCaseIds}
          userRank={userRank}
          highestStreak={highestStreak}
          onSelectCase={selectCase}
          onStartEndless={startEndless}
        />
      )}

      {/* Active Investigation Interface */}
      {status !== 'selecting' && currentCase && (
        <>
          {/* Endless Mode Banner Header */}
          {mode === 'endless' && (
            <EndlessAuditHeader
              streak={streak}
              highestStreak={highestStreak}
              onExitEndless={returnToDossier}
            />
          )}

          {/* Investigation Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border shadow-xs">
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant={highlighterActive ? 'default' : 'outline'}
                size="sm"
                onClick={toggleHighlighter}
                className={cn(
                  'gap-2 font-bold transition-all duration-200',
                  highlighterActive &&
                    'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-500 shadow-md ring-2 ring-yellow-400/50'
                )}
              >
                <Highlighter className="w-4 h-4" />
                <span>{highlighterActive ? 'Bút dạ quang: ĐANG BẬT' : 'Bật bút dạ quang'}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={retryCase}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại vụ này</span>
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={returnToDossier}
              className="gap-1.5 text-xs font-bold"
            >
              <FolderOpen className="w-4 h-4 text-primary" />
              <span>📁 Danh mục hồ sơ vụ án</span>
            </Button>
          </div>

      {/* Feedback Toast Notification Banner */}
      {lastFeedback && (
        <div
          className={cn(
            'px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-in fade-in-50 duration-200',
            lastFeedback.type === 'correct' &&
              'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-300',
            lastFeedback.type === 'false_alarm' &&
              'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-amber-300',
            lastFeedback.type === 'wrong_option' &&
              'bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-rose-300',
            lastFeedback.type === 'resolved' &&
              'bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 border-blue-300'
          )}
        >
          <span>{lastFeedback.messageVi}</span>
          <span className="text-xs opacity-75 hidden md:inline">{lastFeedback.messageEn}</span>
        </div>
      )}

      {/* Main Detective Desk */}
      {currentCase && (
        <DetectiveDesk
          caseFile={currentCase}
          tokens={tokens}
          highlighterActive={highlighterActive}
          onTokenTap={tapToken}
          onSpeak={speak}
        />
      )}

      {/* Deduction Card Modal */}
      <DeductionCard
        key={activeError?.id ?? 'deduction-card'}
        activeError={activeError}
        isOpen={status === 'deducing' && activeError !== null}
        onSelectOption={submitDeduction}
        onClose={closeDeduction}
        onSpeak={speak}
      />

      {/* Case Solved Victory Modal */}
      <CaseSolvedModal
        isOpen={status === 'solved'}
        caseFile={currentCase}
        starsEarned={starsEarned}
        credibility={credibility}
        elapsedSeconds={elapsedSeconds}
        onNextCase={() => {
          if (mode === 'endless') {
            nextEndlessRound();
          } else {
            const currentIndex = allCases.findIndex((c) => c.id === currentCase?.id);
            const nextIndex = (currentIndex + 1) % allCases.length;
            selectCase(allCases[nextIndex].id);
          }
        }}
        onRetry={retryCase}
        onReturnToDossier={returnToDossier}
      />

      {/* Case Cold Failure Modal */}
      <CaseColdModal
        isOpen={status === 'cold'}
        caseFile={currentCase}
        mistakes={mistakes}
        solvedCount={solvedErrorIds.length}
        onRetry={retryCase}
        onReturnToDossier={returnToDossier}
      />
        </>
      )}
    </div>
  );
}
