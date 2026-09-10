"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface WordleGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WordleGuideModal: React.FC<WordleGuideModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="wordle-guide-modal"
        className="sm:max-w-md bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader className="text-left gap-1">
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Cách Chơi Wordle Master</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Đoán từ tiếng Anh bí mật trong tối đa 6 lượt đoán.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              1. Quy tắc màu sắc sau mỗi lượt đoán
            </h4>
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              Sau mỗi từ bạn nhập và bấm <strong>ENTER</strong>, màu sắc các ô chữ sẽ thay đổi để chỉ dẫn:
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                  W
                </div>
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Màu Xanh lá:</span>{" "}
                  Chữ cái đúng và nằm đúng vị trí.
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                  I
                </div>
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Màu Vàng:</span>{" "}
                  Chữ cái có trong từ nhưng đang nằm sai vị trí.
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-300 font-black flex items-center justify-center text-sm shrink-0">
                  N
                </div>
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400">Màu Xám:</span>{" "}
                  Chữ cái hoàn toàn không có trong từ mục tiêu.
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              2. Hệ thống trợ giúp 3 nấc
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <strong>🔊 Nghe:</strong> Phát âm từ mẫu chuẩn US (Miễn phí, không trừ điểm).
              </li>
              <li>
                <strong>💡 Gợi ý:</strong> Xem nghĩa tiếng Việt và từ loại (-10% XP).
              </li>
              <li>
                <strong>🔍 Tiết lộ:</strong> Lật mở ngay 1 chữ cái chưa biết (-20% XP, tối đa 1 lần/ván).
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              3. Đánh giá số sao
            </h4>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-amber-500">⭐⭐⭐: 1-2 lượt</span>
              <span className="text-amber-500">⭐⭐: 3-4 lượt</span>
              <span className="text-amber-500">⭐: 5-6 lượt</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl min-h-[44px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Đã hiểu, bắt đầu chơi!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
