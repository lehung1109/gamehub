// src/app/chants/[chantId]/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllChants, getChantById } from '@/lib/phonics-chant-engine'
import { KaraokeChantStudio } from '@/components/chant/KaraokeChantStudio'

interface ChantPageProps {
  params: Promise<{ chantId: string }>
}

export async function generateStaticParams() {
  const chants = getAllChants()
  return chants.map((chant) => ({
    chantId: chant.id,
  }))
}

export async function generateMetadata({ params }: ChantPageProps): Promise<Metadata> {
  const { chantId } = await params
  const chant = getChantById(chantId)

  if (!chant) {
    return {
      title: 'Không tìm thấy bài vè | GameHub',
    }
  }

  return {
    title: `${chant.titleVi} - ${chant.titleEn} | Karaoke Phonics GameHub`,
    description: chant.descriptionVi,
  }
}

export default async function ChantDetailPage({ params }: ChantPageProps) {
  const { chantId } = await params
  const chant = getChantById(chantId)

  if (!chant) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <KaraokeChantStudio chant={chant} />
    </main>
  )
}
