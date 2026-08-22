'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ClassroomWithCount } from '@/app/actions/classes'
import { updateClassAction, deactivateClassAction, activateClassAction } from '@/app/actions/classes'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Calendar, Edit3, ShieldAlert, PowerOff, Power, Copy, CheckCircle2, ChevronRight, School } from 'lucide-react'

interface ClassListProps {
  classes: ClassroomWithCount[]
}

export function ClassList({ classes }: ClassListProps) {
  const router = useRouter()
  
  const [selectedForRename, setSelectedForRename] = useState<ClassroomWithCount | null>(null)
  const [renameValue, setRenameValue] = useState('')
  
  const [selectedForDeactivate, setSelectedForDeactivate] = useState<ClassroomWithCount | null>(null)
  
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [actionError, setActionError] = useState<string | null>(null)

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRename = async () => {
    if (!selectedForRename || !renameValue.trim()) return
    setActionError(null)
    
    startTransition(async () => {
      const res = await updateClassAction(selectedForRename.id, { name: renameValue.trim() })
      if (res.error) {
        setActionError(res.error)
      } else {
        setSelectedForRename(null)
        router.refresh()
      }
    })
  }

  const handleDeactivate = async () => {
    if (!selectedForDeactivate) return
    setActionError(null)
    
    startTransition(async () => {
      const res = await deactivateClassAction(selectedForDeactivate.id)
      if (res.error) {
        setActionError(res.error)
      } else {
        setSelectedForDeactivate(null)
        router.refresh()
      }
    })
  }

  const handleActivate = (id: string) => {
    startTransition(async () => {
      // For inline action, we might just fire and forget or handle error globally,
      // but let's log or alert if needed. For now, just call it.
      await activateClassAction(id)
      router.refresh()
    })
  }

  if (classes.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 text-center py-12">
        <CardContent className="space-y-4 max-w-sm mx-auto">
          <div className="size-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <School className="size-7" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-800">
              Chưa có lớp học nào
            </CardTitle>
            <p className="text-sm text-slate-500">
              Hãy tạo lớp học đầu tiên để cung cấp mã lớp cho học sinh và bắt đầu theo dõi kết quả chơi.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const formattedDate = new Date(cls.created_at || '').toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <Card
              key={cls.id}
              className={`flex flex-col justify-between border-slate-200 transition-shadow ${cls.is_active ? 'bg-white hover:shadow-md' : 'bg-slate-50 opacity-80'}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold text-slate-900 line-clamp-1" title={cls.name}>
                    {cls.name}
                  </CardTitle>
                  <Badge variant={cls.is_active ? 'default' : 'secondary'} className={cls.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-200 text-slate-600 hover:bg-slate-200'}>
                    {cls.is_active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                  </Badge>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Mã lớp:</span>
                    <button 
                      onClick={() => handleCopy(cls.id, cls.code)}
                      className="group flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-sm font-mono font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                      title="Sao chép mã lớp"
                    >
                      {cls.code}
                      {copiedId === cls.id ? (
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5 text-slate-400 group-hover:text-indigo-600" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      <span>{cls.student_count} học sinh</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/dashboard/classes/${cls.id}`}
                    className={buttonVariants({
                      size: 'sm',
                      className: 'bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-xs',
                    })}
                  >
                    Xem chi tiết
                    <ChevronRight className="size-3.5 ml-1" />
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedForRename(cls)
                      setRenameValue(cls.name)
                    }}
                    className="text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border-slate-200 text-xs h-8 px-2.5"
                    disabled={isPending}
                  >
                    <Edit3 className="size-3.5 mr-1" />
                    Đổi tên
                  </Button>
                </div>

                {cls.is_active ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedForDeactivate(cls)}
                    className="text-slate-500 hover:bg-red-50 hover:text-red-700 text-xs h-8 px-2.5"
                    disabled={isPending}
                  >
                    <PowerOff className="size-3.5 mr-1" />
                    Vô hiệu hóa
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleActivate(cls.id)}
                    className="text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 text-xs h-8 px-2.5"
                    disabled={isPending}
                  >
                    <Power className="size-3.5 mr-1" />
                    Mở lại
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Rename Dialog */}
      <Dialog 
        open={Boolean(selectedForRename)} 
        onOpenChange={(open) => {
          if (!open && !isPending) {
            setSelectedForRename(null)
            setActionError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi tên lớp học</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="newName">Tên lớp mới</Label>
              <Input
                id="newName"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="VD: Lớp 1A - 2025"
                maxLength={200}
                autoFocus
              />
            </div>
            
            {actionError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-start gap-2">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedForRename(null)} disabled={isPending}>
              Hủy
            </Button>
            <Button onClick={handleRename} disabled={!renameValue.trim() || isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog 
        open={Boolean(selectedForDeactivate)} 
        onOpenChange={(open) => {
          if (!open && !isPending) {
            setSelectedForDeactivate(null)
            setActionError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="size-5" />
              Xác nhận vô hiệu hóa
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn vô hiệu hóa lớp <strong>{selectedForDeactivate?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-slate-600 space-y-2">
            <p>Khi bị vô hiệu hóa:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mã lớp sẽ không còn nhận học sinh mới vào chơi.</li>
              <li>Học sinh đang có session có thể bị yêu cầu nhập mã lớp khác ở lần sau.</li>
              <li><strong>Tất cả dữ liệu lịch sử và kết quả vẫn được bảo toàn.</strong></li>
            </ul>
            
            {actionError && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-start gap-2">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedForDeactivate(null)} disabled={isPending}>
              Hủy
            </Button>
            <Button onClick={handleDeactivate} disabled={isPending} variant="destructive">
              {isPending ? 'Đang xử lý...' : 'Đồng ý vô hiệu hóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
