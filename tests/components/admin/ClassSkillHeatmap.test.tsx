// tests/components/admin/ClassSkillHeatmap.test.tsx

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ClassSkillHeatmap } from '@/components/admin/diagnostics/ClassSkillHeatmap'
import type { ClassDiagnosticSummary } from '@/types/adaptive-learning'

const mockSummary: ClassDiagnosticSummary = {
  classId: 'class-test',
  className: 'Lớp 3A Trực Tuyến',
  studentCount: 3,
  domainAverages: {
    phonics: 68,
    vocabulary: 85,
    grammar: 72,
    listening: 80,
  },
  weakSkillFrequencies: [
    { skillId: 'ph-ending-sounds', skillNameVi: 'Bật âm đuôi (/s/, /k/, /t/)', count: 2 },
  ],
  studentRows: [
    {
      studentId: 's1',
      studentName: 'Trần Minh Khang',
      overallScore: 88,
      tier: 'advanced',
      domainScores: { phonics: 85, vocabulary: 90, grammar: 85, listening: 92 },
      primaryWeakSkill: 'Nguyên âm đôi',
    },
    {
      studentId: 's2',
      studentName: 'Lê Hoàng Yến',
      overallScore: 65,
      tier: 'target',
      domainScores: { phonics: 60, vocabulary: 75, grammar: 60, listening: 65 },
      primaryWeakSkill: 'Bật âm đuôi (/s/, /k/, /t/)',
    },
    {
      studentId: 's3',
      studentName: 'Phạm Đức Anh',
      overallScore: 45,
      tier: 'support',
      domainScores: { phonics: 40, vocabulary: 50, grammar: 45, listening: 45 },
      primaryWeakSkill: 'Trật tự từ trong câu đơn',
    },
  ],
}

describe('ClassSkillHeatmap Component', () => {
  it('renders class header, domain cards, and satisfies kid-friendly typography', () => {
    const { container } = render(<ClassSkillHeatmap summary={mockSummary} />)

    expect(
      screen.getByRole('heading', { name: /bản đồ năng lực: lớp 3a trực tuyến/i })
    ).toBeVisible()
    expect(screen.getByText('Phát Âm (Phonics)')).toBeInTheDocument()
    expect(screen.getByText('Từ Vựng (Vocabulary)')).toBeInTheDocument()
    expect(screen.getByText('Ngữ Pháp (Grammar)')).toBeInTheDocument()
    expect(screen.getByText('Nghe Hiểu (Listening)')).toBeInTheDocument()
    expect(screen.getByText(/điểm nghẽn cần can thiệp ưu tiên trong tuần/i)).toBeInTheDocument()

    // Typography audit
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })

  it('filters students by tier tabs correctly', () => {
    render(<ClassSkillHeatmap summary={mockSummary} />)

    expect(screen.getByText('Trần Minh Khang')).toBeInTheDocument()
    expect(screen.getByText('Lê Hoàng Yến')).toBeInTheDocument()
    expect(screen.getByText('Phạm Đức Anh')).toBeInTheDocument()

    // Filter to advanced only
    const advancedTab = screen.getByRole('button', { name: /nâng cao/i })
    fireEvent.click(advancedTab)

    expect(screen.getByText('Trần Minh Khang')).toBeInTheDocument()
    expect(screen.queryByText('Lê Hoàng Yến')).not.toBeInTheDocument()
    expect(screen.queryByText('Phạm Đức Anh')).not.toBeInTheDocument()

    // Filter to support only
    const supportTab = screen.getByRole('button', { name: /cần hỗ trợ/i })
    fireEvent.click(supportTab)

    expect(screen.queryByText('Trần Minh Khang')).not.toBeInTheDocument()
    expect(screen.getByText('Phạm Đức Anh')).toBeInTheDocument()
  })
})
