import fs from 'node:fs'
import path from 'node:path'

const filePath = path.resolve('src/types/database.ts')
const helperTypes = `
export type StudentGamificationRow = Tables<'student_gamification'>
export type WordBankRow = Tables<'word_bank'>
export type WordBankInsert = TablesInsert<'word_bank'>
export type WordBankUpdate = TablesUpdate<'word_bank'>
export type StudentParentAccessRow = Tables<'student_parent_access'>
export type StudentParentAccessInsert = TablesInsert<'student_parent_access'>
export type StudentParentAccessUpdate = TablesUpdate<'student_parent_access'>
export type ClassroomAnnouncementRow = Tables<'classroom_announcements'>
export type ClassroomAnnouncementInsert = TablesInsert<'classroom_announcements'>
export type ClassroomAnnouncementUpdate = TablesUpdate<'classroom_announcements'>
export type AnnouncementAcknowledgmentRow = Tables<'announcement_acknowledgments'>
export type AnnouncementAcknowledgmentInsert = TablesInsert<'announcement_acknowledgments'>
export type AnnouncementAcknowledgmentUpdate = TablesUpdate<'announcement_acknowledgments'>
`

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf-8')
  if (!content.includes('export type StudentParentAccessRow')) {
    fs.appendFileSync(filePath, helperTypes, 'utf-8')
  }
}
