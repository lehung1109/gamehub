import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateClassCodeAction } from '@/app/actions/classes'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('validateClassCodeAction', () => {
  let mockSupabase: { from: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      from: vi.fn(),
    }

    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>)
  })

  it('returns error when class code is empty', async () => {
    const res1 = await validateClassCodeAction('')
    expect(res1.valid).toBe(false)
    expect(res1.error).toMatch(/nhập mã lớp/i)

    const res2 = await validateClassCodeAction('   ')
    expect(res2.valid).toBe(false)
    expect(res2.error).toMatch(/nhập mã lớp/i)
  })

  it('returns valid true and classroom details when code exists and is active', async () => {
    const mockClass = {
      id: 'cls-123',
      name: 'Lớp 1A - 2025',
      code: 'ABC123',
      is_active: true,
    }

    const singleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const eqMock = vi.fn().mockReturnValue({ single: singleMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

    mockSupabase.from.mockReturnValue({
      select: selectMock,
    })

    const res = await validateClassCodeAction('abc123')

    expect(res.valid).toBe(true)
    expect(res.classId).toBe('cls-123')
    expect(res.className).toBe('Lớp 1A - 2025')
    expect(res.classCode).toBe('ABC123')
    expect(mockSupabase.from).toHaveBeenCalledWith('classrooms')
    expect(eqMock).toHaveBeenCalledWith('code', 'ABC123')
  })

  it('returns friendly error when class code does not exist', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const eqMock = vi.fn().mockReturnValue({ single: singleMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

    mockSupabase.from.mockReturnValue({
      select: selectMock,
    })

    const res = await validateClassCodeAction('NONEXIST')

    expect(res.valid).toBe(false)
    expect(res.error).toBe('Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍')
  })

  it('returns friendly error when class is inactive', async () => {
    const mockClass = {
      id: 'cls-123',
      name: 'Lớp 1A - 2025',
      code: 'INACTIVE',
      is_active: false,
    }

    const singleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const eqMock = vi.fn().mockReturnValue({ single: singleMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

    mockSupabase.from.mockReturnValue({
      select: selectMock,
    })

    const res = await validateClassCodeAction('INACTIVE')

    expect(res.valid).toBe(false)
    expect(res.error).toBe('Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍')
  })
})
