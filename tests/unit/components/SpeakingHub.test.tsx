import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScenarioCard } from '@/components/speaking/ScenarioCard'
import { PersonaSelector } from '@/components/speaking/PersonaSelector'
import SpeakingHubPage from '@/app/speaking/page'
import type { SpeakingScenario, SpeakingPersona } from '@/types/speaking'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/speaking'),
}))

vi.mock('@/hooks/use-student-session', () => ({
  useStudentSession: vi.fn(() => ({
    session: { studentId: 'test-student-id', classCode: 'L1', studentName: 'Nam' },
    isAnonymous: false,
    isLoaded: true,
  })),
}))

vi.mock('@/app/actions/speaking', () => ({
  getStudentSpeakingStatsAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      totalSessions: 8,
      totalMinutes: 24,
      averageAccuracy: 85,
      totalStars: 20,
    },
  }),
}))

const samplePersona: SpeakingPersona = {
  id: 'barista-emma',
  name: 'Emma',
  avatar: '☕',
  role: 'Barista',
  accent: 'us',
  toneVi: 'Niềm nở, tươi vui và kiên nhẫn',
}

const samplePersona2: SpeakingPersona = {
  id: 'friend-liam',
  name: 'Liam',
  avatar: '👋',
  role: 'Exchange Student',
  accent: 'uk',
  toneVi: 'Hòa đồng, thân thiện',
}

const sampleScenario: SpeakingScenario = {
  id: 'ordering-cafe',
  titleVi: 'Gọi đồ uống tại quán cà phê',
  titleEn: 'Ordering at a Café',
  descriptionVi: 'Thực hành gọi đồ uống và món bánh yêu thích với nhân viên pha chế.',
  level: 'A1',
  icon: '☕',
  targetTurns: 4,
  persona: samplePersona,
  initialMessage: 'Hello! Welcome to Sunshine Café.',
  initialHints: [],
}

describe('ScenarioCard Component', () => {
  it('renders scenario details, CEFR badge, and handles selection', () => {
    const onSelect = vi.fn()
    render(<ScenarioCard scenario={sampleScenario} onSelect={onSelect} />)

    expect(screen.getByTestId('scenario-card-ordering-cafe')).toBeInTheDocument()
    expect(screen.getByTestId('start-scenario-ordering-cafe')).toBeInTheDocument()
    expect(screen.getByTestId('cefr-badge')).toHaveTextContent('A1')

    expect(screen.getByText('Gọi đồ uống tại quán cà phê')).toBeInTheDocument()
    expect(screen.getByText('Ordering at a Café')).toBeInTheDocument()
    expect(screen.getByText(/Thực hành gọi đồ uống/i)).toBeInTheDocument()
    expect(screen.getByText(/4 lượt nói/i)).toBeInTheDocument()
    expect(screen.getByText('Emma')).toBeInTheDocument()

    // Clicking start button
    fireEvent.click(screen.getByTestId('start-scenario-ordering-cafe'))
    expect(onSelect).toHaveBeenCalledWith(sampleScenario)
  })

  it('triggers onSelect when entire card is clicked', () => {
    const onSelect = vi.fn()
    render(<ScenarioCard scenario={sampleScenario} onSelect={onSelect} />)

    fireEvent.click(screen.getByTestId('scenario-card-ordering-cafe'))
    expect(onSelect).toHaveBeenCalledWith(sampleScenario)
  })
})

describe('PersonaSelector Component', () => {
  const personas = [samplePersona, samplePersona2]

  it('renders persona options with details and handles onSelect', () => {
    const onSelect = vi.fn()
    render(
      <PersonaSelector
        personas={personas}
        selectedId="barista-emma"
        onSelect={onSelect}
      />
    )

    expect(screen.getByTestId('persona-selector')).toBeInTheDocument()
    expect(screen.getByTestId('persona-barista-emma')).toBeInTheDocument()
    expect(screen.getByTestId('persona-friend-liam')).toBeInTheDocument()

    expect(screen.getByText('Emma')).toBeInTheDocument()
    expect(screen.getByText('Liam')).toBeInTheDocument()
    expect(screen.getByText(/Niềm nở, tươi vui/i)).toBeInTheDocument()

    // Click Liam
    fireEvent.click(screen.getByTestId('persona-friend-liam'))
    expect(onSelect).toHaveBeenCalledWith('friend-liam')
  })
})

describe('SpeakingHubPage (/speaking)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders speaking hub with hero, stats ribbon, and CEFR filter chips', async () => {
    render(<SpeakingHubPage />)

    expect(screen.getByTestId('speaking-hub')).toBeInTheDocument()
    expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    expect(screen.getByTestId('filter-a1')).toBeInTheDocument()
    expect(screen.getByTestId('filter-a2')).toBeInTheDocument()
    expect(screen.getByTestId('filter-b1')).toBeInTheDocument()
    expect(screen.getByTestId('filter-b2')).toBeInTheDocument()

    // Verify back to home link
    const homeLink = screen.getByRole('link', { name: /về trang chủ/i })
    expect(homeLink).toHaveAttribute('href', '/')

    // Verify stats ribbon loads
    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument() // 8 sessions
      expect(screen.getByText('24')).toBeInTheDocument() // 24 minutes
      expect(screen.getByText(/85%/)).toBeInTheDocument() // 85% accuracy
    })
  })

  it('filters scenarios when CEFR filter chip is clicked', async () => {
    render(<SpeakingHubPage />)

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    // Initially "all" shows A1, A2, B1, B2 scenarios
    expect(screen.getByTestId('scenario-card-ordering-cafe')).toBeInTheDocument() // A1
    expect(screen.getByTestId('scenario-card-hotel-checkin')).toBeInTheDocument() // B1

    // Click A1 filter
    fireEvent.click(screen.getByTestId('filter-a1'))

    expect(screen.getByTestId('scenario-card-ordering-cafe')).toBeInTheDocument()
    expect(screen.queryByTestId('scenario-card-hotel-checkin')).not.toBeInTheDocument()

    // Click B1 filter
    fireEvent.click(screen.getByTestId('filter-b1'))
    expect(screen.queryByTestId('scenario-card-ordering-cafe')).not.toBeInTheDocument()
    expect(screen.getByTestId('scenario-card-hotel-checkin')).toBeInTheDocument()

    // Click all filter to restore
    fireEvent.click(screen.getByTestId('filter-all'))
    expect(screen.getByTestId('scenario-card-ordering-cafe')).toBeInTheDocument()
    expect(screen.getByTestId('scenario-card-hotel-checkin')).toBeInTheDocument()
  })

  it('navigates to scenario practice page when scenario is selected', async () => {
    render(<SpeakingHubPage />)

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    const startButton = screen.getByTestId('start-scenario-ordering-cafe')
    fireEvent.click(startButton)

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/speaking\/ordering-cafe/)
    )
  })
})
