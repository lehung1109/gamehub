'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, MapPin } from 'lucide-react';
import worldsData from '@/data/curriculum/worlds.json';
import type { RoadmapWorld, RoadmapNode } from '@/types/roadmap';
import { useStudentSession } from '@/contexts/StudentSessionContext';
import { isNodeUnlocked, isWorldUnlocked } from '@/lib/roadmap';
import { Container } from '@/components/ui/container';
import { WorldSelector } from '@/components/roadmap/WorldSelector';
import { RoadmapMap } from '@/components/roadmap/RoadmapMap';
import { RoadmapNodeModal } from '@/components/roadmap/RoadmapNodeModal';
import { DailyStreakBadge } from '@/components/student/DailyStreakBadge';
import { MistakeNotebookBadge } from '@/components/student/MistakeNotebookBadge';
import { StudentProfileBadge } from '@/components/StudentProfileBadge';
import { StudentBadge } from '@/components/student/StudentBadge';
import { StudentJoinPopup } from '@/components/student/StudentJoinPopup';

export default function RoadmapPage() {
  const worlds = worldsData as RoadmapWorld[];
  const [selectedWorldId, setSelectedWorldId] = useState<string>(worlds[0]?.id || 'world-1');
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { roadmapState } = useStudentSession();

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId) || worlds[0];
  const isWorldOpen = isWorldUnlocked(selectedWorld, worlds, roadmapState);

  const handleSelectNode = (node: RoadmapNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  // Compute stars for selected world
  const currentWorldStars = selectedWorld.nodes.reduce(
    (sum, n) => sum + (roadmapState.nodesProgress[n.id]?.stars || 0),
    0
  );
  const maxWorldStars = selectedWorld.nodes.length * 3;
  const worldProgressPercent =
    maxWorldStars > 0 ? Math.round((currentWorldStars / maxWorldStars) * 100) : 0;

  const isSelectedNodeUnlocked = selectedNode
    ? isWorldOpen && isNodeUnlocked(selectedNode, roadmapState)
    : false;

  const selectedNodeProgress = selectedNode
    ? roadmapState.nodesProgress[selectedNode.id]
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground pb-20">
      {/* Top HUD Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {/* Back to Home & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center size-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Về trang chủ"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 text-slate-900 dark:text-white">
                <span>🗺️</span>
                <span>Lộ Trình Học Tập</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                Chinh phục 4 thế giới tiếng Anh theo chuẩn CEFR
              </p>
            </div>
          </div>

          {/* Right Stats & Badges */}
          <div className="flex items-center gap-2">
            {/* Total Stars Counter */}
            <div
              data-testid="roadmap-hud-stars"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-black text-xs sm:text-sm shadow-xs"
              title="Tổng số sao đạt được trong lộ trình"
            >
              <Star className="size-4 text-amber-500 fill-amber-400" />
              <span>{roadmapState.totalStars}</span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold hidden sm:inline">
                sao
              </span>
            </div>

            {/* Student Gamification Badges */}
            <DailyStreakBadge />
            <MistakeNotebookBadge />
            <StudentProfileBadge />
            <StudentBadge />
          </div>
        </div>
      </header>

      <Container className="max-w-4xl pt-6">
        {/* World Selector Tabs */}
        <div className="mb-6">
          <WorldSelector
            worlds={worlds}
            selectedWorldId={selectedWorldId}
            onSelectWorld={setSelectedWorldId}
            progressState={roadmapState}
          />
        </div>

        {/* Selected World Overview Card */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-card via-card to-muted/50 border border-border p-5 sm:p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                  <MapPin className="size-3.5" />
                  <span>{selectedWorld.levelBadge}</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Thế giới {selectedWorld.order} / {worlds.length}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {selectedWorld.titleVi}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {selectedWorld.description}
              </p>
            </div>

            {/* Stars Progress Indicator */}
            <div className="sm:text-right shrink-0 bg-background/80 rounded-2xl p-3 border border-border/80">
              <div className="text-xs font-bold text-muted-foreground mb-1">Tiến độ thế giới</div>
              <div className="flex items-center sm:justify-end gap-1.5 text-base font-black text-foreground">
                <Star className="size-4 text-amber-500 fill-amber-400" />
                <span>
                  {currentWorldStars} / {maxWorldStars}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  ({worldProgressPercent}%)
                </span>
              </div>
              <div className="w-full sm:w-36 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${worldProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Roadmap Map (S-Curve) */}
        <main className="relative bg-card/60 backdrop-blur-xs rounded-3xl border border-border/70 p-4 sm:p-8 shadow-xs">
          <RoadmapMap
            world={selectedWorld}
            progressState={roadmapState}
            isWorldUnlocked={isWorldOpen}
            onSelectNode={handleSelectNode}
          />
        </main>
      </Container>

      {/* Node Detail Popup Modal */}
      <RoadmapNodeModal
        node={selectedNode}
        progress={selectedNodeProgress}
        isUnlocked={isSelectedNodeUnlocked}
        isWorldUnlocked={isWorldOpen}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <StudentJoinPopup />
    </div>
  );
}
