'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  configName: string
  isDeleting?: boolean
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  configName,
  isDeleting = false,
}: DeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-md bg-white p-6">
        <DialogHeader className="gap-2">
          <div className="size-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Xác nhận xóa cấu hình
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 space-y-2">
            <span>
              Bạn có chắc chắn muốn xóa cấu hình <strong>&ldquo;{configName}&rdquo;</strong>?
            </span>
            <span className="block text-xs text-red-600 font-medium">
              ⚠️ Thao tác này là vĩnh viễn, không thể hoàn tác. Các đường link chia sẻ tới cấu hình này sẽ không còn hoạt động.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Xác nhận xóa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
