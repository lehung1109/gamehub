// src/app/spelling-bee/[divisionId]/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllDivisions, getDivisionById } from '@/lib/spelling-bee-engine'
import { SpellingBeeArena } from '@/components/spelling-bee/SpellingBeeArena'

interface SpellingBeePageProps {
  params: Promise<{ divisionId: string }>
}

export async function generateStaticParams() {
  const divisions = getAllDivisions()
  return divisions.map((division) => ({
    divisionId: division.id,
  }))
}

export async function generateMetadata({
  params,
}: SpellingBeePageProps): Promise<Metadata> {
  const { divisionId } = await params
  const division = getDivisionById(divisionId)

  if (!division) {
    return {
      title: 'Không tìm thấy phân hạng giải đấu | GameHub',
    }
  }

  return {
    title: `${division.titleVi} - ${division.titleEn} | Phonics Spelling Bee GameHub`,
    description: division.descriptionVi,
  }
}

export default async function SpellingBeeDivisionDetailPage({
  params,
}: SpellingBeePageProps) {
  const { divisionId } = await params
  const division = getDivisionById(divisionId)

  if (!division) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-900/5">
      <SpellingBeeArena division={division} />
    </main>
  )
}
