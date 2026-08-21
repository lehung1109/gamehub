// tests/app/admin/configs/edit-page.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import EditConfigPage, { generateMetadata } from '@/app/admin/configs/[configId]/page'

const { mockGetConfigById, mockNotFound } = vi.hoisted(() => ({
  mockGetConfigById: vi.fn(),
  mockNotFound: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound()
    throw new Error('NEXT_NOT_FOUND')
  },
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/app/actions/configs', () => ({
  getConfigById: (...args: unknown[]) => mockGetConfigById(...args),
  updateConfig: vi.fn(),
}))

describe('EditConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers notFound when config is not found', async () => {
    mockGetConfigById.mockResolvedValue({ data: null, error: 'Không tìm thấy cấu hình' })

    const params = Promise.resolve({ configId: 'non-existent' })
    await expect(EditConfigPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('renders ConfigEditForm when config is found', async () => {
    const configData = {
      id: 'cfg-100',
      user_id: 'user-1',
      game_id: 'flashcard',
      name: 'Flashcard Demo',
      settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
      share_slug: null,
      is_active: true,
      created_at: '2026-08-21T00:00:00Z',
      updated_at: '2026-08-21T00:00:00Z',
    }

    mockGetConfigById.mockResolvedValue({ data: configData, error: null })

    const params = Promise.resolve({ configId: 'cfg-100' })
    const Component = await EditConfigPage({ params })
    render(Component)

    expect(screen.getByText(/chỉnh sửa cấu hình/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Flashcard Demo')).toBeInTheDocument()
  })

  it('generates correct metadata', async () => {
    mockGetConfigById.mockResolvedValue({
      data: { id: 'cfg-100', name: 'Flashcard Tiếng Anh 1', game_id: 'flashcard' },
      error: null,
    })

    const params = Promise.resolve({ configId: 'cfg-100' })
    const metadata = await generateMetadata({ params })
    expect(metadata.title).toContain('Flashcard Tiếng Anh 1')
  })
})
