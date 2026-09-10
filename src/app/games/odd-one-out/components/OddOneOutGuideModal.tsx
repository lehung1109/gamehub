"use client";

import React from "react";
import { Scissors, Lightbulb, Keyboard, Target, Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface OddOneOutGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OddOneOutGuideModal: React.FC<OddOneOutGuideModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="odd-one-out-guide-modal"
        className="sm:max-w-md bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader className="text-left gap-1">
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Cách Chơi Odd One Out</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Truy tìm từ khác biệt - Thử thách tư duy phân loại và mở rộng từ vựng tiếng Anh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {/* Section 1: Objective */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" />
              1. Mục tiêu trò chơi
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Mỗi câu hỏi gồm <strong>4 thẻ từ</strong>. Trong đó có <strong>3 từ</strong> cùng thuộc một nhóm ngữ nghĩa hoặc chủ đề, và <strong>1 từ lạc loài</strong>. Hãy tìm và chọn từ khác biệt đó!
            </p>
          </div>

          {/* Section 2: Score & Combo Streak */}
          <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              2. Điểm số & Chuỗi combo
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Đoán đúng để nhận điểm và xây dựng chuỗi combo (streak). Chuỗi combo càng cao sẽ nhân thêm điểm thưởng cho mỗi câu đúng liên tiếp!
            </p>
          </div>

          {/* Section 3: Hints */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              3. Công cụ trợ giúp
            </h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <Scissors className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span><strong>50/50:</strong> Loại bỏ bớt 2 phương án sai, giữ lại thẻ từ lạc loài và 1 từ đánh lạc hướng.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Gợi ý:</strong> Hiển thị gợi ý về chủ đề chung của các từ cùng nhóm.</span>
              </li>
            </ul>
          </div>

          {/* Section 4: Keyboard Shortcuts */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-slate-500" />
              4. Phím tắt bàn phím
            </h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• Phím <strong>1, 2, 3, 4</strong>: Chọn nhanh thẻ từ tương ứng</li>
              <li>• Phím <strong>Enter</strong>: Kiểm tra đáp án hoặc Chuyển sang câu tiếp</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl min-h-[44px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            Đã hiểu, bắt đầu chơi!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
