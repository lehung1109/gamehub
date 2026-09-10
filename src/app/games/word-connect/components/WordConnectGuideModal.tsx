"use client";

import React from "react";
import { Sparkles, Shuffle, Lightbulb, MoveRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface WordConnectGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WordConnectGuideModal: React.FC<WordConnectGuideModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="word-connect-guide-modal"
        className="sm:max-w-md bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader className="text-left gap-1">
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Cách Chơi Word Connect</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Nối các chữ cái trên đĩa tròn để tạo thành các từ tiếng Anh có nghĩa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 my-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {/* Section 1: Connect letters */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <MoveRight className="w-4 h-4 text-amber-500" />
              1. Cách nối chữ
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có thể <strong>kéo vuốt</strong> ngón tay / chuột liên tục qua các chữ cái trên đĩa tròn, hoặc <strong>bấm lần lượt từng chữ</strong> rồi nhấn nút <strong>Gửi từ (✓)</strong>.
            </p>
          </div>

          {/* Section 2: Target Words */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              2. Bảng ô chữ mục tiêu
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Mỗi màn chơi có các ô chữ mục tiêu cần giải. Khi đoán đúng, từ đó sẽ lật mở đầy đủ nghĩa tiếng Việt và phát âm. Giải hết toàn bộ để qua màn!
            </p>
          </div>

          {/* Section 3: Bonus Jar */}
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              3. Hũ từ thưởng (Bonus Words)
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Nếu bạn ghép được một từ tiếng Anh hợp lệ nhưng không có trên bảng ô chữ, từ đó sẽ tự động bay vào <strong>Hũ từ thưởng</strong> (+10 điểm/từ)!
            </p>
          </div>

          {/* Section 4: Power-ups & Helpers */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              4. Các nút trợ giúp
            </h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-slate-500 shrink-0" />
                <span><strong>Xáo trộn:</strong> Đảo vị trí các chữ cái để dễ nhìn ra từ mới.</span>
              </li>
              <li className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Gợi ý:</strong> Lật mở ngẫu nhiên 1 chữ cái trên bảng ô chữ.</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl min-h-[44px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer"
          >
            Đã hiểu, bắt đầu chơi!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
