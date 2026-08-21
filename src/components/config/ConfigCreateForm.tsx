'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Game } from '@/types'
import type { AnyGameSettings, GameId } from '@/types/config'
import { getDefaultSettings } from '@/lib/game-config-schema'
import { createConfig } from '@/app/actions/configs'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FlashcardConfigForm } from './FlashcardConfigForm'
import { AlphabetConfigForm } from './AlphabetConfigForm'
import { ListeningConfigForm } from './ListeningConfigForm'
import { SpellingConfigForm } from './SpellingConfigForm'
import { NumbersColorsConfigForm } from './NumbersColorsConfigForm'
import { SentencesConfigForm } from './SentencesConfigForm'
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  game: Game
}

export function ConfigCreateForm({ game }: Props) {
  const router = useRouter()
  const gameId = game.id as GameId
  const [name, setName] = useState('')
  const [settings, setSettings] = useState<AnyGameSettings>(() => getDefaultSettings(gameId))
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function renderGameSpecificForm() {
    switch (gameId) {
      case 'flashcard':
        return (
          <FlashcardConfigForm
            settings={settings as never}
            onChange={setSettings}
            disabled={isPending}
          />
        )
      case 'alphabet':
        return (
          <AlphabetConfigForm
            settings={settings as never}
            onChange={setSettings}
            disabled={isPending}
          />
        )
      case 'listening':
        return (
          <ListeningConfigForm
            settings={settings as never}
            onChange={setSettings}
            disabled={isPending}
          />
        )
      case 'spelling':
        return (
          <SpellingConfigForm
            settings={settings as never}
            onChange={setSettings}
            disabled={isPending}
          />
        )
      case 'numbers-colors':
        return (
          <NumbersColorsConfigForm
            settings={settings as never}
            onChange={setSettings}
            disabled={isPending}
          />
        )
      case 'sentences':
        return (
          <SentencesConfigForm
            settings={settings as never}
            onChange={setSettings}
            disabled={isPending}
          />
        )
      default:
        return null
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isPending) return
    setErrorMessage('')

    const trimmed = name.trim()
    if (!trimmed) {
      setErrorMessage('Tên cấu hình là bắt buộc')
      return
    }

    if (trimmed.length > 200) {
      setErrorMessage('Tên cấu hình không được vượt quá 200 ký tự')
      return
    }

    startTransition(async () => {
      try {
        const res = await createConfig({
          gameId,
          name: trimmed,
          settings: settings as unknown as Record<string, unknown>,
        })

        if (res?.error) {
          setErrorMessage(res.error)
        } else {
          router.push(`/admin/games/${gameId}`)
          router.refresh()
        }
      } catch {
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={game.titleVi}>
              {game.emoji}
            </span>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Tạo cấu hình mới: {game.titleVi}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {game.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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

          {/* Config Name */}
          <div className="space-y-2">
            <Label htmlFor="configName" className="text-sm font-semibold text-slate-800">
              Tên cấu hình bài học <span className="text-red-500">*</span>
            </Label>
            <Input
              id="configName"
              placeholder="Ví dụ: Lớp 1A - Bài học tuần 3, Ôn tập chủ đề Động vật..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              maxLength={200}
              className="text-base sm:text-sm"
              required
            />
            <p className="text-xs text-slate-500">
              Đặt tên dễ nhớ để phân biệt các bài học khác nhau cho học sinh.
            </p>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Game-Specific Settings */}
          {renderGameSpecificForm()}
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-4 border-t border-slate-100 bg-slate-50/50">
          <Link
            href={`/admin/games/${gameId}`}
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'text-slate-600 hover:text-slate-900 border-slate-200',
            })}
          >
            <ArrowLeft className="size-4 mr-1" />
            Hủy & Quay lại
          </Link>

          <Button
            type="submit"
            disabled={isPending || !name.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" />
                Đang lưu cấu hình...
              </>
            ) : (
              <>
                <Save className="size-4 mr-1.5" />
                Lưu cấu hình
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
