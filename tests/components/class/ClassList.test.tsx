// tests/components/class/ClassList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClassList } from '@/components/class/ClassList'
import * as classActions from '@/app/actions/classes'

vi.mock('@/app/actions/classes', () => ({
  updateClassAction: vi.fn(),
  deactivateClassAction: vi.fn(),
  activateClassAction: vi.fn(),
}))

const mockRouterRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
    push: vi.fn(),
  }),
}))

describe('ClassList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state if no classes', () => {
    render(<ClassList classes={[]} />)
    expect(screen.getByText(/chưa có lớp học nào/i)).toBeInTheDocument()
  })

  it('renders a list of classes', () => {
    const mockClasses = [
      {
        id: 'cls-1',
        teacher_id: 't-1',
        name: 'Lớp 1A',
        code: 'ABC123',
        is_active: true,
        created_at: new Date().toISOString(),
        student_count: 5,
      },
      {
        id: 'cls-2',
        teacher_id: 't-1',
        name: 'Lớp 2B',
        code: 'XYZ789',
        is_active: false,
        created_at: new Date().toISOString(),
        student_count: 0,
      },
    ]

    render(<ClassList classes={mockClasses} />)

    expect(screen.getByText('Lớp 1A')).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
    expect(screen.getByText(/5 học sinh/i)).toBeInTheDocument()
    expect(screen.getByText(/đang hoạt động/i)).toBeInTheDocument()

    expect(screen.getByText('Lớp 2B')).toBeInTheDocument()
    expect(screen.getByText('XYZ789')).toBeInTheDocument()
    expect(screen.getByText(/đã vô hiệu hóa/i)).toBeInTheDocument()
  })

  it('allows deactivating an active class', async () => {
    const mockClasses = [
      {
        id: 'cls-1',
        teacher_id: 't-1',
        name: 'Lớp 1A',
        code: 'ABC123',
        is_active: true,
        created_at: new Date().toISOString(),
        student_count: 5,
      },
    ]
    
    vi.mocked(classActions.deactivateClassAction).mockResolvedValue({ data: { ...mockClasses[0], is_active: false } })

    render(<ClassList classes={mockClasses} />)

    // Find and click the vô hiệu hóa button
    const deactivateBtn = screen.getByRole('button', { name: /vô hiệu hóa/i })
    fireEvent.click(deactivateBtn)

    // Verify it asks for confirmation (via dialog, or calls the action directly if no dialog in test)
    // Assuming we use a dialog for confirmation:
    expect(screen.getByText(/xác nhận vô hiệu hóa/i)).toBeInTheDocument()
    
    const confirmBtn = screen.getByRole('button', { name: /đồng ý/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(classActions.deactivateClassAction).toHaveBeenCalledWith('cls-1')
    })
    expect(mockRouterRefresh).toHaveBeenCalled()
  })

  it('allows activating a deactivated class', async () => {
    const mockClasses = [
      {
        id: 'cls-2',
        teacher_id: 't-1',
        name: 'Lớp 2B',
        code: 'XYZ789',
        is_active: false,
        created_at: new Date().toISOString(),
        student_count: 0,
      },
    ]
    
    vi.mocked(classActions.activateClassAction).mockResolvedValue({ data: { ...mockClasses[0], is_active: true } })

    render(<ClassList classes={mockClasses} />)

    const activateBtn = screen.getByRole('button', { name: /mở lại/i })
    fireEvent.click(activateBtn)

    await waitFor(() => {
      expect(classActions.activateClassAction).toHaveBeenCalledWith('cls-2')
    })
    expect(mockRouterRefresh).toHaveBeenCalled()
  })

  it('allows renaming a class', async () => {
    const mockClasses = [
      {
        id: 'cls-1',
        teacher_id: 't-1',
        name: 'Lớp 1A',
        code: 'ABC123',
        is_active: true,
        created_at: new Date().toISOString(),
        student_count: 5,
      },
    ]
    
    vi.mocked(classActions.updateClassAction).mockResolvedValue({ data: { ...mockClasses[0], name: 'Lớp 1A Mới' } })

    render(<ClassList classes={mockClasses} />)

    const renameBtn = screen.getByRole('button', { name: /đổi tên/i })
    fireEvent.click(renameBtn)

    // Should open dialog with input
    const input = screen.getByLabelText(/tên lớp mới/i)
    fireEvent.change(input, { target: { value: 'Lớp 1A Mới' } })

    const saveBtn = screen.getByRole('button', { name: /lưu/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(classActions.updateClassAction).toHaveBeenCalledWith('cls-1', { name: 'Lớp 1A Mới' })
    })
    expect(mockRouterRefresh).toHaveBeenCalled()
  })
})
