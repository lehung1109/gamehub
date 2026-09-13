// src/app/passport/[shareToken]/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPassportByShareToken } from '@/lib/passport-engine'
import { PassportHub } from '@/components/passport/PassportHub'

interface SharedPassportPageProps {
  params: Promise<{ shareToken: string }>
}

export async function generateStaticParams() {
  return [
    {
      shareToken: 'DEMO-PASSPORT-2026',
    },
  ]
}

export async function generateMetadata({ params }: SharedPassportPageProps): Promise<Metadata> {
  const { shareToken } = await params
  const passport = getPassportByShareToken(shareToken)

  if (!passport) {
    return {
      title: 'Không tìm thấy hộ chiếu học tập | GameHub',
    }
  }

  return {
    title: `Hồ Sơ Năng Lực Của ${passport.studentName} - Hộ Chiếu GameHub`,
    description: `Xem thành tích tiếng Anh, các đoạn thu âm giọng nói và chứng chỉ tốt nghiệp của ${passport.studentName}.`,
  }
}

export default async function SharedPassportPage({ params }: SharedPassportPageProps) {
  const { shareToken } = await params
  const passport = getPassportByShareToken(shareToken)

  if (!passport) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PassportHub initialPassport={passport} isPublicView={true} />
    </main>
  )
}
