"use client";

import React, { useEffect } from "react";
import { SkillType } from "@/types/vocab-defense";
import { Swords, Shield, Zap } from "lucide-react";

interface ActionDockProps {
  heroEnergy: number;
  onSelectSkill: (skill: SkillType) => void;
  disabled: boolean;
}

export const ActionDock: React.FC<ActionDockProps> = ({
  heroEnergy,
  onSelectSkill,
  disabled,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || e.repeat) return;
      if (e.key === "1") onSelectSkill("ATTACK");
      if (e.key === "2") onSelectSkill("SHIELD");
      if (e.key === "3" && heroEnergy >= 100) onSelectSkill("ULTIMATE");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, heroEnergy, onSelectSkill]);

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl">
      <div className="text-xs font-bold text-slate-400 mb-3 text-center uppercase tracking-wider">
        Chọn Kỹ Năng Xuất Chiêu (Phím tắt 1, 2, 3)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* Attack */}
        <button
          type="button"
          disabled={disabled}
          aria-keyshortcuts="1"
          onClick={() => onSelectSkill("ATTACK")}
          className="group relative flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800/80 hover:from-amber-600/30 hover:to-amber-500/20 border border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span>⚔️ Tấn Công Thường</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">1</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Từ vựng • +25 Nộ • 35-45 DMG</p>
          </div>
        </button>

        {/* Shield */}
        <button
          type="button"
          disabled={disabled}
          aria-keyshortcuts="2"
          onClick={() => onSelectSkill("SHIELD")}
          className="group relative flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800/80 hover:from-sky-600/30 hover:to-sky-500/20 border border-slate-700 hover:border-sky-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span>🛡️ Thủ Hộ & Hồi Máu</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">2</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Luyện Nghe • +25 HP & Khiên</p>
          </div>
        </button>

        {/* Ultimate */}
        <button
          type="button"
          disabled={disabled || heroEnergy < 100}
          aria-keyshortcuts="3"
          onClick={() => onSelectSkill("ULTIMATE")}
          className={`group relative flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
            heroEnergy >= 100
              ? "bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-400/80 shadow-lg shadow-amber-500/20 hover:scale-[1.02] cursor-pointer animate-pulse"
              : "bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-60"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              heroEnergy >= 100
                ? "bg-amber-400 text-slate-950 border-amber-300 font-bold"
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
          >
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span>⚡ Tuyệt Chiêu Rồng</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">3</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {heroEnergy >= 100 ? "SẴN SÀNG! • 80-120 DMG" : `Cần 100 Nộ (${heroEnergy}/100)`}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
