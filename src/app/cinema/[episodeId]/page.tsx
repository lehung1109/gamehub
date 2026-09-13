// src/app/cinema/[episodeId]/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllEpisodes, getEpisodeById } from '@/lib/phonics-cinema-engine'
import { PhonicsCinemaPlayer } from '@/components/cinema/PhonicsCinemaPlayer'

interface CinemaEpisodePageProps {
  params: Promise<{ episodeId: string }>
}

export async function generateStaticParams() {
  const episodes = getAllEpisodes()
  return episodes.map((ep) => ({
    episodeId: ep.id,
  }))
}

export async function generateMetadata({
  params,
}: CinemaEpisodePageProps): Promise<Metadata> {
  const { episodeId } = await params
  const episode = getEpisodeById(episodeId)

  if (!episode) {
    return {
      title: 'Không tìm thấy tập phim | GameHub Phonics Cinema',
    }
  }

  return {
    title: `${episode.titleVi} (${episode.titleEn}) | Phonics Cinema GameHub`,
    description: episode.synopsisVi,
  }
}

export default async function CinemaEpisodeDetailPage({
  params,
}: CinemaEpisodePageProps) {
  const { episodeId } = await params
  const episode = getEpisodeById(episodeId)

  if (!episode) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsCinemaPlayer episode={episode} />
    </main>
  )
}
