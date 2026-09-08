"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface FeedbackOverlayProps {
  isCorrect: boolean;
  explanation?: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  isCorrect,
  explanation,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border mb-4 flex items-start gap-3 animate-in fade-in duration-200 ${
        isCorrect
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : "bg-rose-500/10 border-rose-500/30 text-rose-300"
      }`}
    >
      {isCorrect ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      )}
      <div className="text-xs md:text-sm">
        <p className="font-bold">{isCorrect ? "Chính xác! Đòn đánh thành công!" : "Chưa chính xác! Quái vật phản công!"}</p>
        {explanation && <p className="text-slate-300 mt-1">{explanation}</p>}
      </div>
    </div>
  );
};
