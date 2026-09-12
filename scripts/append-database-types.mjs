import fs from 'node:fs'
import path from 'node:path'

const filePath = path.resolve('src/types/database.ts')
const helperTypes = `
export type StudentGamificationRow = Tables<'student_gamification'>
export type WordBankRow = Tables<'word_bank'>
export type WordBankInsert = TablesInsert<'word_bank'>
export type WordBankUpdate = TablesUpdate<'word_bank'>
`

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf-8')
  if (!content.includes('export type StudentGamificationRow')) {
    fs.appendFileSync(filePath, helperTypes, 'utf-8')
  }
}
