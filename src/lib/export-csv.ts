// src/lib/export-csv.ts

export interface CsvSessionRecord {
  studentName: string
  gameName: string
  topic?: string | null
  score?: number | null
  totalQuestions?: number | null
  completedAt?: string | null
}

/**
 * Escapes a single CSV field value per RFC 4180 and protects against CSV Formula Injection:
 * - Neutralizes formula triggers (=, +, -, @, \t, \r) by prepending a single quote (')
 * - If value contains commas, quotes, or newlines, wrap in double quotes
 * - Escape existing double quotes with two double quotes (" -> "")
 */
export function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  let str = String(value)

  // Prevent CSV Formula Injection for formulas, but keep standalone '-' placeholder clean
  if (/^\s*[=+\-@\t\r]/.test(str) && str.trim() !== '-') {
    str = "'" + str
  }

  const mustQuote =
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')

  if (mustQuote) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Formats a date string into readable Vietnamese format DD/MM/YYYY HH:mm (UTC+7 Vietnam Time)
 */
export function formatCsvDateVi(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return '-'
  }

  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) {
      return '-'
    }

    // Force UTC+7 (Vietnam Time) for consistent server-side rendering regardless of deployment timezone
    const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000)

    const day = String(vnTime.getUTCDate()).padStart(2, '0')
    const month = String(vnTime.getUTCMonth() + 1).padStart(2, '0')
    const year = vnTime.getUTCFullYear()
    const hours = String(vnTime.getUTCHours()).padStart(2, '0')
    const minutes = String(vnTime.getUTCMinutes()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return '-'
  }
}

/**
 * Generates a full CSV string with UTF-8 BOM (\uFEFF) for Excel compatibility.
 * Spec requirements:
 * Columns: Tên học sinh, Game, Chủ đề, Điểm, Tổng câu, Ngày chơi
 */
export function generateClassSessionsCsv(records: CsvSessionRecord[]): string {
  const BOM = '\uFEFF'
  const headers = ['Tên học sinh', 'Game', 'Chủ đề', 'Điểm', 'Tổng câu', 'Ngày chơi']
  const headerLine = headers.map(escapeCsvField).join(',')

  const rows = records.map((record) => {
    const studentName = escapeCsvField(record.studentName || 'Học sinh')
    const gameName = escapeCsvField(record.gameName || 'Chung')
    const topic = escapeCsvField(record.topic || 'Mặc định')
    const score = escapeCsvField(record.score !== null && record.score !== undefined ? record.score : '-')
    const totalQuestions = escapeCsvField(
      record.totalQuestions !== null && record.totalQuestions !== undefined ? record.totalQuestions : '-'
    )
    const dateFormatted = escapeCsvField(formatCsvDateVi(record.completedAt))

    return [studentName, gameName, topic, score, totalQuestions, dateFormatted].join(',')
  })

  const lines = [headerLine, ...rows]
  return BOM + lines.join('\r\n')
}
