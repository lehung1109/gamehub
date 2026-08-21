// tests/components/admin/DeleteDialog.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteDialog } from '@/components/admin/DeleteDialog'

describe('DeleteDialog Component', () => {
  it('renders correctly when open with config name and warning text', () => {
    render(
      <DeleteDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        configName="Bộ từ vựng Lớp 1"
      />
    )

    expect(
      screen.getByRole('heading', { name: /xác nhận xóa cấu hình/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/Bộ từ vựng Lớp 1/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hủy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /xác nhận xóa/i })).toBeInTheDocument()
  })

  it('does not render content when isOpen is false', () => {
    render(
      <DeleteDialog
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        configName="Bộ từ vựng Lớp 1"
      />
    )

    expect(screen.queryByRole('heading', { name: /xác nhận xóa cấu hình/i })).not.toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(
      <DeleteDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        configName="Bộ từ vựng Lớp 1"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /hủy/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when confirm delete button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <DeleteDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        configName="Bộ từ vựng Lớp 1"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /xác nhận xóa/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('shows loading state and disables buttons when isDeleting is true', () => {
    render(
      <DeleteDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        configName="Bộ từ vựng Lớp 1"
        isDeleting={true}
      />
    )

    const confirmBtn = screen.getByRole('button', { name: /đang xóa/i })
    expect(confirmBtn).toBeDisabled()
    expect(screen.getByRole('button', { name: /hủy/i })).toBeDisabled()
  })
})
