import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  ClassLeaderboardTable,
} from '@/components/leaderboard/ClassLeaderboardTable'
import {
  GlobalLeaderboardTable,
} from '@/components/leaderboard/GlobalLeaderboardTable'
import LeaderboardHubPage from '@/app/leaderboard/page'
import {
  getClassLeaderboardAction,
  getGlobalLeaderboardAction,
  LeaderboardEntry,
} from '@/app/actions/leaderboards'
import { DuelPodiumModal } from '@/components/duel/DuelPodiumModal'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

vi.mock('@/app/actions/leaderboards', () => ({
  getClassLeaderboardAction: vi.fn(),
  getGlobalLeaderboardAction: vi.fn(),
}))

let mockSession: { studentName: string; classCode?: string } | null = null
vi.mock('@/contexts/StudentSessionContext', () => ({
  useStudentSession: () => ({
    session: mockSession,
  }),
}))

const sampleEntries: LeaderboardEntry[] = [
  {
    rank: 1,
    studentName: 'Nguyễn Văn A',
    avatar: '🦁',
    totalStars: 150,
    currentStreak: 10,
    duelWins: 5,
    levelName: 'Chiến Binh Đồng',
    frameClass: 'ring-amber-400',
    titleName: 'Thần đồng Tiếng Anh',
  },
  {
    rank: 2,
    studentName: 'Trần Thị B',
    avatar: '🦊',
    totalStars: 120,
    currentStreak: 7,
    duelWins: 3,
    levelName: 'Tập Sự',
    frameClass: 'ring-slate-400',
    titleName: 'Thợ Săn Từ Vựng',
  },
  {
    rank: 3,
    studentName: 'Lê Văn C',
    avatar: '🐼',
    totalStars: 95,
    currentStreak: 4,
    duelWins: 2,
    levelName: 'Tập Sự',
    frameClass: 'ring-amber-700',
    titleName: 'Ngôi Sao Sáng',
  },
  {
    rank: 4,
    studentName: 'Phạm Thị D',
    avatar: '🦄',
    totalStars: 80,
    currentStreak: 2,
    duelWins: 1,
    levelName: 'Người Khởi Đầu',
  },
  {
    rank: 5,
    studentName: 'Hoàng Văn E',
    avatar: '🐸',
    totalStars: 60,
    currentStreak: 1,
    duelWins: 0,
    levelName: 'Người Khởi Đầu',
  },
]

describe('ClassLeaderboardTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table container and podium for top 3 plus rows for rank 4+', () => {
    render(
      <ClassLeaderboardTable
        entries={sampleEntries}
        classCode="LOPHOC1"
      />
    )

    expect(screen.getByTestId('class-leaderboard-table')).toBeDefined()
    expect(screen.getByTestId('podium-rank-1')).toBeDefined()
    expect(screen.getByTestId('podium-rank-2')).toBeDefined()
    expect(screen.getByTestId('podium-rank-3')).toBeDefined()

    // 1st place content
    expect(screen.getByTestId('podium-rank-1').textContent).toContain('Nguyễn Văn A')
    expect(screen.getByTestId('podium-rank-1').textContent).toContain('150')
    expect(screen.getByTestId('podium-rank-1').textContent).toContain('10')
    expect(screen.getByTestId('podium-rank-1').textContent).toContain('5')
    expect(screen.getByTestId('podium-rank-1').textContent).toContain('Thần đồng Tiếng Anh')

    // Table rows for 4th and 5th
    expect(screen.getByTestId('leaderboard-row-4')).toBeDefined()
    expect(screen.getByTestId('leaderboard-row-4').textContent).toContain('Phạm Thị D')
    expect(screen.getByTestId('leaderboard-row-4').textContent).toContain('80')

    expect(screen.getByTestId('leaderboard-row-5')).toBeDefined()
    expect(screen.getByTestId('leaderboard-row-5').textContent).toContain('Hoàng Văn E')
  })

  it('renders empty state when entries is empty', () => {
    render(
      <ClassLeaderboardTable
        entries={[]}
        classCode="LOPHOC1"
      />
    )

    expect(screen.getByTestId('class-leaderboard-table')).toBeDefined()
    expect(screen.queryByTestId('podium-rank-1')).toBeNull()
    expect(screen.getByText(/Chưa có dữ liệu bảng xếp hạng/i)).toBeDefined()
  })

  it('handles class code search submit', () => {
    const onSearchClass = vi.fn()
    render(
      <ClassLeaderboardTable
        entries={[]}
        classCode=""
        onSearchClass={onSearchClass}
      />
    )

    const input = screen.getByTestId('class-code-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'class99' } })

    const searchButton = screen.getByRole('button', { name: /tìm/i })
    fireEvent.click(searchButton)

    expect(onSearchClass).toHaveBeenCalledWith('CLASS99')
  })

  it('displays loading state and error message properly', () => {
    const { rerender } = render(
      <ClassLeaderboardTable
        entries={[]}
        isLoading={true}
      />
    )
    expect(screen.getByText(/Đang tải dữ liệu/i)).toBeDefined()

    rerender(
      <ClassLeaderboardTable
        entries={[]}
        errorMessage="Không tìm thấy mã lớp"
      />
    )
    expect(screen.getByText('Không tìm thấy mã lớp')).toBeDefined()
  })
})

describe('GlobalLeaderboardTable', () => {
  it('renders podium, rows, and timeframe toggle buttons', () => {
    const onTimeframeChange = vi.fn()
    render(
      <GlobalLeaderboardTable
        entries={sampleEntries}
        timeframe="weekly"
        onTimeframeChange={onTimeframeChange}
      />
    )

    expect(screen.getByTestId('global-leaderboard-table')).toBeDefined()
    expect(screen.getByTestId('timeframe-weekly')).toBeDefined()
    expect(screen.getByTestId('timeframe-all')).toBeDefined()

    expect(screen.getByTestId('podium-rank-1')).toBeDefined()
    expect(screen.getByTestId('leaderboard-row-4')).toBeDefined()

    fireEvent.click(screen.getByTestId('timeframe-all'))
    expect(onTimeframeChange).toHaveBeenCalledWith('all')
  })

  it('renders empty state when entries is empty', () => {
    render(
      <GlobalLeaderboardTable
        entries={[]}
        timeframe="all"
        onTimeframeChange={vi.fn()}
      />
    )

    expect(screen.getByText(/Chưa có dữ liệu bảng vàng/i)).toBeDefined()
  })
})

describe('LeaderboardHubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession = { studentName: 'Học sinh A', classCode: 'LOP123' }
    vi.mocked(getClassLeaderboardAction).mockResolvedValue({
      success: true,
      data: sampleEntries,
    })
    vi.mocked(getGlobalLeaderboardAction).mockResolvedValue({
      success: true,
      data: sampleEntries,
    })
  })

  it('loads classroom leaderboard on mount if classCode is in student session', async () => {
    render(<LeaderboardHubPage />)

    expect(screen.getByTestId('leaderboard-hub')).toBeDefined()
    expect(screen.getByTestId('tab-class-leaderboard')).toBeDefined()
    expect(screen.getByTestId('tab-global-leaderboard')).toBeDefined()

    await waitFor(() => {
      expect(getClassLeaderboardAction).toHaveBeenCalledWith('LOP123')
      expect(screen.getByTestId('podium-rank-1')).toBeDefined()
    })
  })

  it('switches to global leaderboard tab and fetches global data', async () => {
    render(<LeaderboardHubPage />)

    const globalTab = screen.getByTestId('tab-global-leaderboard')
    fireEvent.click(globalTab)

    await waitFor(() => {
      expect(getGlobalLeaderboardAction).toHaveBeenCalled()
      expect(screen.getByTestId('global-leaderboard-table')).toBeDefined()
    })
  })

  it('switches timeframe in global tab and refetches', async () => {
    render(<LeaderboardHubPage />)

    fireEvent.click(screen.getByTestId('tab-global-leaderboard'))

    await waitFor(() => {
      expect(screen.getByTestId('global-leaderboard-table')).toBeDefined()
    })

    const allBtn = screen.getByTestId('timeframe-all')
    fireEvent.click(allBtn)

    await waitFor(() => {
      expect(getGlobalLeaderboardAction).toHaveBeenCalledWith('all')
    })
  })

  it('contains navigation links to home and duel', async () => {
    render(<LeaderboardHubPage />)

    await waitFor(() => {
      expect(getClassLeaderboardAction).toHaveBeenCalled()
    })

    const homeLink = screen.getByRole('link', { name: /trang chủ/i })
    expect(homeLink.getAttribute('href')).toBe('/')

    const duelLink = screen.getByRole('link', { name: /đấu trường/i })
    expect(duelLink.getAttribute('href')).toBe('/duel')
  })

  it('allows searching a different class code from the hub', async () => {
    render(<LeaderboardHubPage />)

    await waitFor(() => {
      expect(getClassLeaderboardAction).toHaveBeenCalledWith('LOP123')
    })

    const input = screen.getByTestId('class-code-input')
    fireEvent.change(input, { target: { value: 'NEWCLASS' } })

    const searchBtn = screen.getByRole('button', { name: /tìm/i })
    fireEvent.click(searchBtn)

    await waitFor(() => {
      expect(getClassLeaderboardAction).toHaveBeenCalledWith('NEWCLASS')
    })
  })
})

describe('DuelPodiumModal - Deferred Minor Fix', () => {
  it('renders rematch error banner inline when rematchError is provided', () => {
    render(
      <DuelPodiumModal
        isOpen={true}
        winnerName="Học sinh A"
        isTie={false}
        isWinner={true}
        player1={{ name: 'Học sinh A', avatar: '🦁', score: 100 }}
        player2={{ name: 'Học sinh B', avatar: '🦊', score: 80 }}
        onRematch={vi.fn()}
        onBackToHub={vi.fn()}
        rematchError="Đối thủ đã rời khỏi phòng"
      />
    )

    const errorBanner = screen.getByTestId('rematch-error-banner')
    expect(errorBanner).toBeDefined()
    expect(errorBanner.textContent).toContain('Đối thủ đã rời khỏi phòng')
  })
})

