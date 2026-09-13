import fs from 'node:fs'
import path from 'node:path'

const filePath = path.resolve('src/types/database.ts')

const helperTypes = `
export type StudentGamificationRow = Tables<'student_gamification'>
export type WordBankRow = Tables<'word_bank'>
export type WordBankInsert = TablesInsert<'word_bank'>
export type WordBankUpdate = TablesUpdate<'word_bank'>
export type StudentRoadmapProgressRow = Tables<'student_roadmap_progress'>
export type StudentRoadmapProgressInsert = TablesInsert<'student_roadmap_progress'>
export type StudentRoadmapProgressUpdate = TablesUpdate<'student_roadmap_progress'>
export type PvpDuelRow = Tables<'pvp_duels'>
export type PvpDuelInsert = TablesInsert<'pvp_duels'>
export type PvpDuelUpdate = TablesUpdate<'pvp_duels'>
export type StudentSpeakingSessionRow = Tables<'student_speaking_sessions'>
export type StudentSpeakingSessionInsert = TablesInsert<'student_speaking_sessions'>
export type StudentSpeakingSessionUpdate = TablesUpdate<'student_speaking_sessions'>
export type CommunitySharedConfigRow = Tables<'community_shared_configs'>
export type CommunitySharedConfigInsert = TablesInsert<'community_shared_configs'>
export type CommunitySharedConfigUpdate = TablesUpdate<'community_shared_configs'>
export type StudentParentAccessRow = Tables<'student_parent_access'>
export type StudentParentAccessInsert = TablesInsert<'student_parent_access'>
export type StudentParentAccessUpdate = TablesUpdate<'student_parent_access'>
export type ClassroomAnnouncementRow = Tables<'classroom_announcements'>
export type ClassroomAnnouncementInsert = TablesInsert<'classroom_announcements'>
export type ClassroomAnnouncementUpdate = TablesUpdate<'classroom_announcements'>
export type AnnouncementAcknowledgmentRow = Tables<'announcement_acknowledgments'>
export type AnnouncementAcknowledgmentInsert = TablesInsert<'announcement_acknowledgments'>
export type AnnouncementAcknowledgmentUpdate = TablesUpdate<'announcement_acknowledgments'>
export type PushSubscriptionRow = Tables<'push_subscriptions'>
export type PushSubscriptionInsert = TablesInsert<'push_subscriptions'>
export type PushSubscriptionUpdate = TablesUpdate<'push_subscriptions'>
`

const studentRoadmapTableDef = `      student_roadmap_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          high_score: number
          id: string
          is_completed: boolean
          node_id: string
          stars: number
          student_id: string
          updated_at: string
          world_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          high_score?: number
          id?: string
          is_completed?: boolean
          node_id: string
          stars: number
          student_id: string
          updated_at?: string
          world_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          high_score?: number
          id?: string
          is_completed?: boolean
          node_id?: string
          stars?: number
          student_id?: string
          updated_at?: string
          world_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_roadmap_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
`

const pvpDuelsTableDef = `      pvp_duels: {
        Row: {
          code: string
          created_at: string
          current_question_index: number
          id: string
          player1_answers: Json
          player1_avatar: string
          player1_name: string
          player1_score: number
          player2_answers: Json
          player2_avatar: string | null
          player2_name: string | null
          player2_score: number
          questions: Json
          status: string
          topic: string
          updated_at: string
          winner_name: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_question_index?: number
          id?: string
          player1_answers?: Json
          player1_avatar?: string
          player1_name: string
          player1_score?: number
          player2_answers?: Json
          player2_avatar?: string | null
          player2_name?: string | null
          player2_score?: number
          questions?: Json
          status?: string
          topic?: string
          updated_at?: string
          winner_name?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_question_index?: number
          id?: string
          player1_answers?: Json
          player1_avatar?: string
          player1_name?: string
          player1_score?: number
          player2_answers?: Json
          player2_avatar?: string | null
          player2_name?: string | null
          player2_score?: number
          questions?: Json
          status?: string
          topic?: string
          updated_at?: string
          winner_name?: string | null
        }
        Relationships: []
      }
`

const speakingSessionsTableDef = `      student_speaking_sessions: {
        Row: {
          created_at: string
          fluency_score: number
          id: string
          mispronounced_words: Json
          overall_score: number
          persona_id: string
          pronunciation_score: number
          scenario_id: string
          stars: number
          student_id: string | null
          total_turns: number
          turns_transcript: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          fluency_score?: number
          id?: string
          mispronounced_words?: Json
          overall_score?: number
          persona_id?: string
          pronunciation_score?: number
          scenario_id: string
          stars?: number
          student_id?: string | null
          total_turns?: number
          turns_transcript?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          fluency_score?: number
          id?: string
          mispronounced_words?: Json
          overall_score?: number
          persona_id?: string
          pronunciation_score?: number
          scenario_id?: string
          stars?: number
          student_id?: string | null
          total_turns?: number
          turns_transcript?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_speaking_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
`

const communityConfigsTableDef = `      community_shared_configs: {
        Row: {
          author_id: string
          author_name: string
          cefr_level: string
          clone_count: number
          config_id: string | null
          created_at: string
          description: string | null
          game_id: string
          id: string
          likes_count: number
          settings: Json
          tags: string[]
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name?: string
          cefr_level?: string
          clone_count?: number
          config_id?: string | null
          created_at?: string
          description?: string | null
          game_id: string
          id?: string
          likes_count?: number
          settings?: Json
          tags?: string[]
          title: string
          topic?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string
          cefr_level?: string
          clone_count?: number
          config_id?: string | null
          created_at?: string
          description?: string | null
          game_id?: string
          id?: string
          likes_count?: number
          settings?: Json
          tags?: string[]
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_shared_configs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "game_configs"
            referencedColumns: ["id"]
          },
        ]
      }
`

const parentPortalTableDef = `      student_parent_access: {
        Row: {
          access_pin: string
          access_token: string
          classroom_id: string
          created_at: string
          id: string
          last_accessed_at: string | null
          parent_name: string | null
          parent_phone: string | null
          student_id: string
        }
        Insert: {
          access_pin: string
          access_token: string
          classroom_id: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          student_id: string
        }
        Update: {
          access_pin?: string
          access_token?: string
          classroom_id?: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          student_id?: string
        }
        Relationships: []
      }
      classroom_announcements: {
        Row: {
          category: string
          classroom_id: string
          content: string
          created_at: string
          id: string
          priority: string
          student_id: string | null
          teacher_id: string
          title: string
        }
        Insert: {
          category?: string
          classroom_id: string
          content: string
          created_at?: string
          id?: string
          priority?: string
          student_id?: string | null
          teacher_id: string
          title: string
        }
        Update: {
          category?: string
          classroom_id?: string
          content?: string
          created_at?: string
          id?: string
          priority?: string
          student_id?: string | null
          teacher_id?: string
          title?: string
        }
        Relationships: []
      }
      announcement_acknowledgments: {
        Row: {
          acknowledged_at: string
          announcement_id: string
          id: string
          parent_name: string | null
          student_id: string
        }
        Insert: {
          acknowledged_at?: string
          announcement_id: string
          id?: string
          parent_name?: string | null
          student_id: string
        }
        Update: {
          acknowledged_at?: string
          announcement_id?: string
          id?: string
          parent_name?: string | null
          student_id?: string
        }
        Relationships: []
      }
`

const pushSubscriptionsTableDef = `      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_notified_at: string | null
          p256dh: string
          parent_token: string | null
          preferences: Json
          student_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_notified_at?: string | null
          p256dh: string
          parent_token?: string | null
          preferences?: Json
          student_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_notified_at?: string | null
          p256dh?: string
          parent_token?: string | null
          preferences?: Json
          student_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
`

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf-8')

  if (!content.includes('student_roadmap_progress: {')) {
    const target = '    Tables: {\n'
    if (content.includes(target)) {
      content = content.replace(target, target + studentRoadmapTableDef)
      fs.writeFileSync(filePath, content, 'utf-8')
      content = fs.readFileSync(filePath, 'utf-8')
    }
  }

  if (!content.includes('pvp_duels: {')) {
    const target = '    Tables: {\n'
    if (content.includes(target)) {
      content = content.replace(target, target + pvpDuelsTableDef)
      fs.writeFileSync(filePath, content, 'utf-8')
      content = fs.readFileSync(filePath, 'utf-8')
    }
  }

  if (!content.includes('student_speaking_sessions: {')) {
    const target = '    Tables: {\n'
    if (content.includes(target)) {
      content = content.replace(target, target + speakingSessionsTableDef)
      fs.writeFileSync(filePath, content, 'utf-8')
      content = fs.readFileSync(filePath, 'utf-8')
    }
  }

  if (!content.includes('community_shared_configs: {')) {
    const target = '    Tables: {\n'
    if (content.includes(target)) {
      content = content.replace(target, target + communityConfigsTableDef)
      fs.writeFileSync(filePath, content, 'utf-8')
      content = fs.readFileSync(filePath, 'utf-8')
    }
  }

  if (!content.includes('student_parent_access: {')) {
    const target = '    Tables: {\n'
    if (content.includes(target)) {
      content = content.replace(target, target + parentPortalTableDef)
      fs.writeFileSync(filePath, content, 'utf-8')
      content = fs.readFileSync(filePath, 'utf-8')
    }
  }

  const newline = content.includes('\r\n') ? '\r\n' : '\n'

  if (!content.includes('push_subscriptions: {')) {
    const regex = /( {4}Tables: \{\r?\n)/
    const match = regex.exec(content)
    if (match) {
      const formattedDef = pushSubscriptionsTableDef.replace(/\r?\n/g, newline)
      content = content.slice(0, match.index + match[0].length) + formattedDef + content.slice(match.index + match[0].length)
      fs.writeFileSync(filePath, content, 'utf-8')
      content = fs.readFileSync(filePath, 'utf-8')
    }
  }

  if (!content.includes('export type StudentGamificationRow')) {
    fs.appendFileSync(filePath, helperTypes, 'utf-8')
  } else {
    if (!content.includes('export type StudentRoadmapProgressRow')) {
      fs.appendFileSync(
        filePath,
        `export type StudentRoadmapProgressRow = Tables<'student_roadmap_progress'>
export type StudentRoadmapProgressInsert = TablesInsert<'student_roadmap_progress'>
export type StudentRoadmapProgressUpdate = TablesUpdate<'student_roadmap_progress'>
`,
        'utf-8'
      )
    }
    if (!content.includes('export type PvpDuelRow')) {
      fs.appendFileSync(
        filePath,
        `export type PvpDuelRow = Tables<'pvp_duels'>
export type PvpDuelInsert = TablesInsert<'pvp_duels'>
export type PvpDuelUpdate = TablesUpdate<'pvp_duels'>
`,
        'utf-8'
      )
    }
    if (!content.includes('export type StudentSpeakingSessionRow')) {
      fs.appendFileSync(
        filePath,
        `export type StudentSpeakingSessionRow = Tables<'student_speaking_sessions'>
export type StudentSpeakingSessionInsert = TablesInsert<'student_speaking_sessions'>
export type StudentSpeakingSessionUpdate = TablesUpdate<'student_speaking_sessions'>
`,
        'utf-8'
      )
    }
    if (!content.includes('export type CommunitySharedConfigRow')) {
      fs.appendFileSync(
        filePath,
        `export type CommunitySharedConfigRow = Tables<'community_shared_configs'>
export type CommunitySharedConfigInsert = TablesInsert<'community_shared_configs'>
export type CommunitySharedConfigUpdate = TablesUpdate<'community_shared_configs'>
`,
        'utf-8'
      )
    }
    if (!content.includes('export type StudentParentAccessRow')) {
      fs.appendFileSync(
        filePath,
        `export type StudentParentAccessRow = Tables<'student_parent_access'>
export type StudentParentAccessInsert = TablesInsert<'student_parent_access'>
export type StudentParentAccessUpdate = TablesUpdate<'student_parent_access'>
export type ClassroomAnnouncementRow = Tables<'classroom_announcements'>
export type ClassroomAnnouncementInsert = TablesInsert<'classroom_announcements'>
export type ClassroomAnnouncementUpdate = TablesUpdate<'classroom_announcements'>
export type AnnouncementAcknowledgmentRow = Tables<'announcement_acknowledgments'>
export type AnnouncementAcknowledgmentInsert = TablesInsert<'announcement_acknowledgments'>
export type AnnouncementAcknowledgmentUpdate = TablesUpdate<'announcement_acknowledgments'>
`,
        'utf-8'
      )
    }
    if (!content.includes('export type PushSubscriptionRow')) {
      fs.appendFileSync(
        filePath,
        `export type PushSubscriptionRow = Tables<'push_subscriptions'>
export type PushSubscriptionInsert = TablesInsert<'push_subscriptions'>
export type PushSubscriptionUpdate = TablesUpdate<'push_subscriptions'>
`,
        'utf-8'
      )
    }
  }
}
