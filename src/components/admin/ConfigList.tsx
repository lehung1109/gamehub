'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Game } from '@/types'
import type { GameConfig } from '@/types/config'
import { deleteConfig } from '@/app/actions/configs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteDialog } from './DeleteDialog'
import { Plus, Layers, Calendar, Edit3, Trash2, AlertCircle } from 'lucide-react'

interface ConfigListProps {
  game: Game
  configs: GameConfig[]
}

export function ConfigList({ game, configs }: ConfigListProps) {
  const router = useRouter()
  const [selectedForDelete, setSelectedForDelete] = useState<GameConfig | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleting, startTransition] = useTransition()

  function handleDeleteConfirm() {
    if (!selectedForDelete || isDeleting) return
    setErrorMessage('')

    startTransition(async () => {
      try {
        const res = await deleteConfig(selectedForDelete.id)
        setSelectedForDelete(null)
        if (res?.error) {
          setErrorMessage(res.error)
        } else {
          router.refresh()
        }
      } catch {
        setSelectedForDelete(null)
        setErrorMessage('Không thể xóa cấu hình. Vui lòng thử lại sau.')
      }
    })
  }

  if (configs.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 text-center py-12">
        <CardContent className="space-y-4 max-w-sm mx-auto">
          <div className="size-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Layers className="size-7" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-800">
              Chưa có cấu hình nào
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Hãy tạo bộ cấu hình đầu tiên để cá nhân hóa nội dung và thời lượng bài học cho học sinh.
            </CardDescription>
          </div>
          <Link
            href={`/admin/configs/new?gameId=${game.id}`}
            className={buttonVariants({
              size: 'sm',
              className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
            })}
          >
            <Plus className="size-4 mr-1" />
            Tạo cấu hình đầu tiên
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-medium"
        >
          <AlertCircle className="size-4 text-red-600 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configs.map((config) => {
          const formattedDate = new Date(config.created_at).toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <Card
              key={config.id}
              className="flex flex-col justify-between border-slate-200 bg-white hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                    {config.name}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs shrink-0">
                    {game.titleVi}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Calendar className="size-3" />
                  <span>{formattedDate}</span>
                </div>
              </CardHeader>

              <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/configs/${config.id}`}
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    className: 'text-indigo-600 hover:bg-indigo-50 border-indigo-200 text-xs h-8 px-2.5',
                  })}
                >
                  <Edit3 className="size-3.5 mr-1" />
                  Chỉnh sửa
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedForDelete(config)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 text-xs h-8 px-2.5"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Xóa
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <DeleteDialog
        isOpen={Boolean(selectedForDelete)}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDeleteConfirm}
        configName={selectedForDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  )
}
