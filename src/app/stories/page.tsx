// src/app/stories/page.tsx

import React from 'react'
import { getAllStories } from '@/lib/comic-story-engine'
import { StoryHub } from '@/components/story/StoryHub'

export const metadata = {
  title: 'Kho Truyện Tranh Lồng Tiếng Phonics | GameHub',
  description: 'Thế giới truyện tranh tương tác, lồng tiếng nhân vật và rèn luyện phát âm tiếng Anh',
}

export default function StoriesPage() {
  const stories = getAllStories()

  return (
    <main className="min-h-screen bg-slate-50">
      <StoryHub stories={stories} />
    </main>
  )
}
