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

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf-8')

  if (!content.includes('student_roadmap_progress: {')) {
    const target = '    Tables: {\n'
    if (content.includes(target)) {
      content = content.replace(target, target + studentRoadmapTableDef)
      fs.writeFileSync(filePath, content, 'utf-8')
    }
  }

  if (!content.includes('pvp_duels: {')) {
    const target = '    Tables: {\n'
    if (content.includes(target)) {
      content = content.replace(target, target + pvpDuelsTableDef)
      fs.writeFileSync(filePath, content, 'utf-8')
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
  }
}
