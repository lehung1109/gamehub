// tests/app/admin/dashboard/classes/page.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClassesPage from '@/app/admin/dashboard/classes/page'
import * as classActions from '@/app/actions/classes'

vi.mock('@/app/actions/classes', () => ({
  getClassesAction: vi.fn(),
}))

vi.mock('@/components/class/ClassList', () => ({
  ClassList: ({ classes }: { classes?: Array<{ id: string; name: string }> }) => (
    <div data-testid="class-list-mock">
      Classes count: {classes?.length || 0}
    </div>
  ),
}))

vi.mock('@/components/class/CreateClassForm', () => ({
  CreateClassForm: () => <div data-testid="create-class-form-mock" />,
}))

describe('Classes Dashboard Page', () => {
  it('renders page header, create form, and class list', async () => {
    const mockClasses = [
      { id: '1', name: 'Lớp 1' },
      { id: '2', name: 'Lớp 2' },
    ]
    
    vi.mocked(classActions.getClassesAction).mockResolvedValue({
      data: mockClasses as unknown as classActions.ClassroomWithCount[],
    })

    const PageContent = await ClassesPage()
    render(PageContent)

    expect(screen.getByRole('heading', { name: /quản lý lớp học/i })).toBeInTheDocument()
    expect(screen.getByTestId('create-class-form-mock')).toBeInTheDocument()
    expect(screen.getByTestId('class-list-mock')).toBeInTheDocument()
    expect(screen.getByText('Classes count: 2')).toBeInTheDocument()
  })

  it('renders error state if action fails', async () => {
    vi.mocked(classActions.getClassesAction).mockResolvedValue({
      error: 'Lỗi tải danh sách lớp abc',
    })

    const PageContent = await ClassesPage()
    render(PageContent)

    expect(screen.getByText(/lỗi tải danh sách lớp abc/i)).toBeInTheDocument()
    expect(screen.getByTestId('class-list-mock')).toBeInTheDocument()
    expect(screen.getByText('Classes count: 0')).toBeInTheDocument()
  })
})
