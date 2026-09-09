import React from "react";

interface BalloonStageProps {
  mistakesCount: number;
  maxMistakes: number;
  wordStatus: "playing" | "won" | "lost";
}

const BALLOON_COLORS = [
  { fill: "#ef4444", border: "#b91c1c", name: "Đỏ" }, // Red
  { fill: "#f97316", border: "#c2410c", name: "Cam" }, // Orange
  { fill: "#eab308", border: "#a16207", name: "Vàng" }, // Yellow
  { fill: "#22c55e", border: "#15803d", name: "Xanh lá" }, // Green
  { fill: "#3b82f6", border: "#1d4ed8", name: "Xanh dương" }, // Blue
  { fill: "#a855f7", border: "#7e22ce", name: "Tím" }, // Purple
];

export const BalloonStage: React.FC<BalloonStageProps> = ({
  mistakesCount,
  maxMistakes,
  wordStatus,
}) => {
  const remainingCount = Math.max(0, maxMistakes - mistakesCount);

  return (
    <div
      role="region"
      aria-label="Khu vực khinh khí cầu"
      className="relative w-full max-w-2xl h-64 md:h-72 bg-gradient-to-b from-sky-900/60 via-slate-900/80 to-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-4 shadow-xl select-none"
    >
      {/* Sky status banner */}
      <div className="flex items-center justify-between w-full px-2 text-base font-bold text-slate-300">
        <span className="flex items-center gap-1.5">
          🎈 Bóng bay còn lại:{" "}
          <span className="font-mono text-lg font-black text-amber-400">
            {remainingCount}/{maxMistakes}
          </span>
        </span>
        {wordStatus === "won" && (
          <span className="text-emerald-400 font-black animate-bounce text-base">
            🎉 THẮNG RỒI!
          </span>
        )}
        {wordStatus === "lost" && (
          <span className="text-amber-400 font-black text-base">
            🪂 HẠ CÁNH AN TOÀN!
          </span>
        )}
      </div>

      {/* Balloons Cluster */}
      <div className="relative flex items-center justify-center gap-2 mt-2">
        {BALLOON_COLORS.map((b, idx) => {
          const isPopped = idx < mistakesCount;
          return (
            <div
              key={idx}
              data-testid="balloon-item"
              className={`transition-all duration-300 flex flex-col items-center ${
                isPopped
                  ? "opacity-0 scale-50 pointer-events-none"
                  : "opacity-100 scale-100 hover:scale-105"
              }`}
            >
              {/* SVG Balloon */}
              <svg width="40" height="52" viewBox="0 0 40 52" className="drop-shadow-md">
                <ellipse cx="20" cy="22" rx="18" ry="21" fill={b.fill} stroke={b.border} strokeWidth="2" />
                <polygon points="17,43 23,43 20,46" fill={b.border} />
                <line x1="20" y1="46" x2="20" y2="52" stroke="#94a3b8" strokeWidth="1.5" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Floating Explorer Character */}
      <div className="flex flex-col items-center mt-2 mb-2">
        <div className="text-5xl md:text-6xl transition-transform duration-300 transform hover:scale-110">
          {wordStatus === "won" ? "🧑‍🚀" : wordStatus === "lost" ? "🪂" : "🧑‍🚀"}
        </div>
        <div className="text-base font-bold text-slate-300 mt-1">
          {wordStatus === "won"
            ? "Nhà thám hiểm an toàn!"
            : wordStatus === "lost"
            ? "Đã bung dù cứu hộ!"
            : "Đang bay lơ lửng..."}
        </div>
      </div>
    </div>
  );
};
