// src/app/guilds/[guildId]/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllGuilds, getGuildById } from '@/lib/guild-engine'
import { GuildDetailView } from '@/components/guild/GuildDetailView'

interface GuildPageProps {
  params: Promise<{ guildId: string }>
}

export async function generateStaticParams() {
  const guilds = getAllGuilds()
  return guilds.map((guild) => ({
    guildId: guild.id,
  }))
}

export async function generateMetadata({ params }: GuildPageProps): Promise<Metadata> {
  const { guildId } = await params
  const guild = getGuildById(guildId)

  if (!guild) {
    return {
      title: 'Không tìm thấy bang hội | GameHub',
    }
  }

  return {
    title: `${guild.name} (${guild.code}) - Trụ Sở Bang Hội | GameHub`,
    description: guild.description,
  }
}

export default async function GuildDetailPage({ params }: GuildPageProps) {
  const { guildId } = await params
  const guild = getGuildById(guildId)

  if (!guild) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <GuildDetailView initialGuild={guild} />
    </main>
  )
}
