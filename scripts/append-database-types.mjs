import fs from 'node:fs'
import path from 'node:path'

const filePath = path.resolve('src/types/database.ts')

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

export const baseHelperTypes = `
export type StudentGamificationRow = Tables<'student_gamification'>
export type WordBankRow = Tables<'word_bank'>
export type WordBankInsert = TablesInsert<'word_bank'>
export type WordBankUpdate = TablesUpdate<'word_bank'>
export type StudentSpeakingSessionRow = Tables<'student_speaking_sessions'>
export type StudentSpeakingSessionInsert = TablesInsert<'student_speaking_sessions'>
export type StudentSpeakingSessionUpdate = TablesUpdate<'student_speaking_sessions'>
`

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf-8')
  const newline = content.includes('\r\n') ? '\r\n' : '\n'

  if (!content.includes('student_speaking_sessions: {')) {
    const regex = /( {4}\}\r?\n {4}Views: \{)/
    const match = regex.exec(content)
    if (match) {
      const formattedDef = speakingSessionsTableDef.replace(/\r?\n/g, newline)
      content = content.slice(0, match.index) + formattedDef + content.slice(match.index)
      fs.writeFileSync(filePath, content, 'utf-8')
      content = fs.readFileSync(filePath, 'utf-8')
    }
  }

  if (!content.includes('export type StudentSpeakingSessionRow')) {
    const speakingTypes = `export type StudentSpeakingSessionRow = Tables<'student_speaking_sessions'>
export type StudentSpeakingSessionInsert = TablesInsert<'student_speaking_sessions'>
export type StudentSpeakingSessionUpdate = TablesUpdate<'student_speaking_sessions'>
`
    const formattedHelper = speakingTypes.replace(/\r?\n/g, newline)
    fs.appendFileSync(filePath, formattedHelper, 'utf-8')
  }
}
