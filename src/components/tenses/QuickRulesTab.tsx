"use client";

import { useState } from "react";
import { Volume2, VolumeX, ArrowRight, BookOpen, Layers, Briefcase } from "lucide-react";
import { GrammarRuleCard } from "@/types/tenses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

export interface QuickRulesTabProps {
  rules?: GrammarRuleCard[];
  stageCount?: number;
  onStartPractice?: () => void;
  className?: string;
}

interface AudioButtonProps {
  text: string;
  className?: string;
}

function AudioButton({ text, className }: AudioButtonProps) {
  const { speak, isSpeaking, isSupported } = useSpeech({ rate: 0.85, lang: "en-US" });
  const hasText = Boolean(text && text.trim());
  const isActionable = isSupported && hasText;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActionable) return;
    speak(text);
  };

  if (!hasText) return null;

  const titleText = !isSupported
    ? "Trình duyệt không hỗ trợ phát âm"
    : `Nghe phát âm: "${text}"`;

  const ariaLabelText = !isSupported
    ? `Phát âm (không khả dụng): "${text}"`
    : `Phát âm: "${text}"`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={!isActionable}
      onClick={handleSpeak}
      aria-label={ariaLabelText}
      title={titleText}
      className={cn(
        "min-h-[44px] min-w-[44px] h-11 w-11 rounded-lg p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-200 dark:hover:bg-indigo-950/60 cursor-pointer shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500",
        isSpeaking && "animate-pulse bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300",
        className
      )}
    >
      {isSupported ? (
        <Volume2 className={cn("size-4", isSpeaking && "scale-110")} aria-hidden="true" />
      ) : (
        <VolumeX className="size-4 text-muted-foreground" aria-hidden="true" />
      )}
    </Button>
  );
}

export function QuickRulesTab({
  rules = [],
  stageCount = 3,
  onStartPractice,
  className,
}: QuickRulesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!rules || rules.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-card">
        <BookOpen className="size-10 mx-auto text-muted-foreground mb-3 opacity-60" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">Không có dữ liệu quy tắc</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Dữ liệu tóm tắt quy tắc ngữ pháp cho thì này hiện chưa được khởi tạo.
        </p>
      </div>
    );
  }

  const categories = [
    { id: "all", label: "Tất cả" },
    { id: "to-be", label: "Động từ To Be" },
    { id: "action-verbs", label: "Động từ thường" },
    { id: "spelling-rules", label: "Quy tắc -s/-es" },
    { id: "adverbs-frequency", label: "Trạng từ tần suất" },
    { id: "workplace-usage", label: "Ứng dụng công sở" },
  ];

  const filteredRules = selectedCategory === "all"
    ? rules
    : rules.filter((r) => r.category === selectedCategory);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Category Navigation Pills */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin"
        role="group"
        aria-label="Lọc quy tắc theo chủ điểm"
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={isActive}
              className={cn(
                "min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                isActive
                  ? "bg-indigo-600 text-white shadow-xs dark:bg-indigo-500"
                  : "bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Rules Cards Grid */}
      {filteredRules.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">Không tìm thấy quy tắc cho danh mục đã chọn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRules.map((rule) => (
            <Card
              key={rule.id}
              className="flex flex-col border border-border/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors bg-card"
            >
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {rule.titleEn}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    Quy tắc cốt lõi
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {rule.titleVi}
                </CardTitle>
                {rule.summaryVi && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {rule.summaryVi}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Formulas Section */}
                  {rule.formulas && rule.formulas.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Layers className="size-3.5 text-indigo-500" aria-hidden="true" />
                        <span>Công thức & Cấu trúc</span>
                      </div>
                      {rule.formulas.map((f, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-muted/60 border border-border/60 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                            <span className="font-bold text-foreground">{f.label}</span>
                            <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50 break-all">
                              {f.structure}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                            <div className="text-xs space-y-0.5 min-w-0">
                              <p className="font-medium text-foreground italic break-words">
                                &ldquo;{f.example}&rdquo;
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {f.vietnameseTranslation}
                              </p>
                            </div>
                            <AudioButton text={f.example} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Detailed Rules List */}
                  {rule.rulesList && rule.rulesList.length > 0 && (
                    <div className="space-y-3">
                      {rule.rulesList.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2"
                        >
                          <div>
                            <div className="text-xs font-bold text-foreground">
                              {r.ruleVi}
                            </div>
                            {r.condition && (
                              <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                                Điều kiện: {r.condition}
                              </div>
                            )}
                          </div>

                          {r.examples && r.examples.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {r.examples.map((ex, exIdx) => (
                                <div
                                   key={exIdx}
                                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border/50 text-xs"
                                >
                                  <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-medium text-foreground">
                                        {ex.en}
                                      </span>
                                      {ex.note && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono border border-amber-200/60 dark:border-amber-800/60">
                                          {ex.note}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {ex.vi}
                                    </p>
                                  </div>
                                  <AudioButton text={ex.en} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Workplace Tips */}
                {rule.workplaceTips && rule.workplaceTips.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Briefcase className="size-3.5" aria-hidden="true" />
                      <span>Mẹo công sở & Lưu ý</span>
                    </div>
                    <ul className="space-y-1">
                      {rule.workplaceTips.map((tip, tipIdx) => (
                        <li
                          key={tipIdx}
                          className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed flex items-start gap-1.5"
                        >
                          <span className="text-amber-500 font-bold select-none">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom CTA for starting practice */}
      {onStartPractice && (
        <div className="text-center pt-6 pb-2">
            <Button
              onClick={onStartPractice}
              className="min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm sm:text-base gap-2 shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>Bắt đầu Luyện Tập {stageCount} Chặng</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
        </div>
      )}
    </div>
  );
}
