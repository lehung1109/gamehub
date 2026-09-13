// src/app/stories/[storyId]/page.tsx

import React from 'react'
import { notFound } from 'next/navigation'
import { getAllStories, getStoryById } from '@/lib/comic-story-engine'
import { ComicStoryReader } from '@/components/story/ComicStoryReader'

interface StoryPageProps {
  params: Promise<{ storyId: string }>
}

export function generateStaticParams() {
  const stories = getAllStories()
  return stories.map((s) => ({ storyId: s.id }))
}

export async function generateMetadata({ params }: StoryPageProps) {
  const { storyId } = await params
  const story = getStoryById(storyId)
  if (!story) return { title: 'Không tìm thấy truyện | GameHub' }

  return {
    title: `${story.titleVi} | Truyện Tranh GameHub`,
    description: story.synopsisVi,
  }
}

export default async function ComicStoryPage({ params }: StoryPageProps) {
  const { storyId } = await params
  const story = getStoryById(storyId)

  if (!story) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-100/70">
      <ComicStoryReader story={story} />
    </main>
  )
}
